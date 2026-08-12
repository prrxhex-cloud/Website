const { Buffer } = require('buffer');
const { execSync } = require('child_process');
const { verifyKey } = require('discord-interactions');
const os = require('os');

class KeyAuth {
  constructor(options) {
    this.name = options.name;
    this.ownerid = options.ownerid;
    this.version = options.version;
    this.url = "https://keyauth.win/api/1.3/";
    this.public_key = "5586b4bc69c7a4b487e4563a4cd96afd39140f919bd31cea7d1c6a1e8439422b";
    this.initialized = false;
    this.user_data = null;
    this.app_data = null;
  }

  async init() {
    if (this.initialized) return;
    
    // In an Electron GUI app, we skip checksum checking as it's unreliable when packaged
    // HWID retrieval is still done securely
    
    const post_data = {
      type: "init",
      ver: this.version,
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
      const response = await fetch(this.url, {
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
