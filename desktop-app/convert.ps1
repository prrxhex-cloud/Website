Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\achin\Documents\GitHub\Website\public\logo.jpeg")
$img.Save("C:\Users\achin\Documents\GitHub\Website\desktop-app\www\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
