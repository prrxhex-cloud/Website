const { Buffer } = require('buffer');
const { execSync } = require('child_process');
const { verifyKey } = require('discord-interactions');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');

// Simple obfuscated key for string encryption (In production, use a more complex key derivation)
const ENCRYPTION_KEY = Buffer.from('4c6f636b6564416e645365637572652131323334353637383930616263646566', 'hex'); // 32 bytes

function decryptString(encryptedHex, ivHex, authTagHex) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return "";
  }
}

// Encrypted: "https://keyauth.win/api/1.3/"
const API_URL_ENC = "f1ce9427c39b68a7575d02f83e87dab9518fbe256a50737f186f64b4";
const API_URL_IV = "aeb5e66505a41f7aab8ed87d";
const API_URL_TAG = "3495a8fe483409c039ee4834f0a3d35d";

// Encrypted: "5586b4bc69c7a4b487e4563a4cd96afd39140f919bd31cea7d1c6a1e8439422b"
const PUB_KEY_ENC = "e4e3bfc4e30b2b6460e4dd90a7ec18e418a8dc169918a4cf9b99307a0dbe74469eb2ca5cc6e3cb75284648d493dacfde5e1a60a0b37ce419cf08fe4fffb4ccbc";
const PUB_KEY_IV = "40adceba5a55470dfb7606fb";
const PUB_KEY_TAG = "2d8a666342ab8082dd6e4de1c615b82f";

class KeyAuth {
  constructor(options) {
    this.name = options.name;
    this.ownerid = options.ownerid;
    this.version = options.version;
    this.url = decryptString(API_URL_ENC, API_URL_IV, API_URL_TAG);
    this.public_key = decryptString(PUB_KEY_ENC, PUB_KEY_IV, PUB_KEY_TAG);
    this.initialized = false;
    this.user_data = null;
    this.app_data = null;
    
    this.verifyExeHash();
  }
  
  verifyExeHash() {
    try {
      if (process.execPath.endsWith('electron.exe')) return; // Ignore in dev mode
      const fileBuffer = fs.readFileSync(process.execPath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const hex = hashSum.digest('hex');
      // In a real scenario, this hash would be sent to the server for validation
      // or compared against a known good hash. We verify that it can be generated.
      this.exe_hash = hex;
    } catch (e) {
      this.exe_hash = "N/A";
    }
  }

  async init() {
    if (this.initialized) return;
    
    // In an Electron GUI app, we skip checksum checking as it's unreliable when packaged
    // HWID retrieval is still done securely
    
    const post_data = {
      type: "init",
      ver: this.version,
      hash: this.exe_hash ? this.exe_hash.toString() : "",
      name: this.name,
      ownerid: this.ownerid,
    };

    const response = await this.__do_request(post_data);
    
    if (response.success) {
      this.initialized = true;
      this.sessionid = response.sessionid;
      this.__load_app_data(response.appinfo);
    } else {
      throw new Error(response.message || "Initialization failed");
    }
  }

  async login(username, password) {
    this.checkinit();
    
    const hwid = this.get_hwid();
    const post_data = {
      type: "login",
      username: username,
      pass: password,
      hwid: hwid,
      sessionid: this.sessionid,
      name: this.name,
      ownerid: this.ownerid,
    };

    const response = await this.__do_request(post_data);

    if (response.success) {
      this.__load_user_data(response.info);
      return response;
    } else {
      throw new Error(response.message || "Login failed");
    }
  }

  async license(key) {
    this.checkinit();
    
    const hwid = this.get_hwid();
    const post_data = {
      type: "license",
      key: key,
      hwid: hwid,
      sessionid: this.sessionid,
      name: this.name,
      ownerid: this.ownerid,
    };

    const response = await this.__do_request(post_data);

    if (response.success) {
      this.__load_user_data(response.info);
      return response;
    } else {
      throw new Error(response.message || "License login failed");
    }
  }

  checkinit() {
    if (!this.sessionid || !this.initialized) {
      throw new Error("Application not initialized");
    }
  }

  get_hwid() {
    const platform = os.platform();
    if (platform === "win32") {
      try {
        const winUser = os.userInfo().username;
        const sidOutput = execSync(`wmic useraccount where name='${winUser}' get sid`).toString().split("\n");
        const sid = sidOutput[1]?.trim();
        if (!sid) {
          return "N/A";
        }
        return sid;
      } catch (error) {
        return "N/A";
      }
    }
    return "N/A"; // fallback for other OS
  }

  async __do_request(data) {
    try {
      const response = await fetch(decryptString(API_URL_ENC, API_URL_IV, API_URL_TAG), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data).toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      
      const signature = response.headers.get("x-signature-ed25519");
      const timestamp = response.headers.get("x-signature-timestamp");
      if (!signature || !timestamp) {
        throw new Error("Missing signature or timestamp in response headers");
      }

      if (!verifyKey(Buffer.from(JSON.stringify(responseData), "utf-8"), signature, timestamp, this.public_key)) {
        throw new Error("Signature checksum failed. Request was tampered with.");
      }

      return responseData;
    } catch (error) {
      throw new Error(error.message || "Unexpected error");
    }
  }

  __load_app_data(data) {
    if (!data) return;
    this.app_data = {
      numUsers: data.numUsers,
      numKeys: data.numKeys,
      app_ver: data.version,
      customer_panel: data.customerPanelLink,
      onlineUsers: data.numOnlineUsers
    };
  }

  __load_user_data(data) {
    if (!data) return;
    this.user_data = {
      username: data.username,
      ip: data.ip,
      hwid: data.hwid || "N/A",
      createdate: data.createdate,
      lastlogin: data.lastlogin,
      subscription: data.subscriptions?.[0]?.subscription,
      subscriptions: data.subscriptions
    };
  }
}

module.exports = KeyAuth;
