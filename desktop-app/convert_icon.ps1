Add-Type -AssemblyName System.Drawing
$inputPath = "www\logo.jpeg"
$outputPath = "www\logo.ico"

$bmp = New-Object System.Drawing.Bitmap $inputPath

# For an ICO file, it expects specific headers, but the easiest way in pure .NET 
# without manually building the ICO header is to use Icon.FromHandle, but it's tricky.
# Let's write the ICO header manually for a simple 256x256 PNG wrapped as ICO.

$memStream = New-Object System.IO.MemoryStream
$bmp.Save($memStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $memStream.ToArray()

$fileStream = New-Object System.IO.FileStream($outputPath, [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($fileStream)

# ICONDIR
$writer.Write([int16]0) # Reserved
$writer.Write([int16]1) # Type (1 = ICO)
$writer.Write([int16]1) # Count (1 image)

# ICONDIRENTRY
$writer.Write([byte]0) # Width (0 = 256)
$writer.Write([byte]0) # Height (0 = 256)
$writer.Write([byte]0) # Color count
$writer.Write([byte]0) # Reserved
$writer.Write([int16]1) # Color planes
$writer.Write([int16]32) # Bits per pixel
$writer.Write([int]$pngBytes.Length) # Image size
$writer.Write([int]22) # Image offset (from beginning of file)

# Write PNG data
$writer.Write($pngBytes)

$writer.Close()
$fileStream.Close()
$memStream.Close()
$bmp.Dispose()

Write-Output "Successfully converted to logo.ico"
