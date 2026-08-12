Add-Type -AssemblyName System.Drawing
$inputPath = "www\logo.jpeg"
$outputPath = "www\logo.png"

try {
    $bmp = New-Object System.Drawing.Bitmap $inputPath
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Successfully converted to logo.png"
} catch {
    Write-Output "Error: $_"
}
