const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'src', 'assets', 'imaguenes', 'Logo.jpg')
const ANDROID_RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res')

const SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
}

async function main() {
  for (const [dir, size] of Object.entries(SIZES)) {
    const outDir = path.join(ANDROID_RES, dir)
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true })
    }
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'))
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'))
    console.log(`Created ${dir} (${size}x${size})`)
  }

  // foreground icon for adaptive icons
  const anydpiDir = path.join(ANDROID_RES, 'mipmap-anydpi-v26')
  if (!fs.existsSync(anydpiDir)) {
    fs.mkdirSync(anydpiDir, { recursive: true })
  }
  await sharp(SOURCE)
    .resize(108, 108, { fit: 'cover' })
    .png()
    .toFile(path.join(anydpiDir, 'ic_launcher_foreground.png'))
  console.log('Created foreground icon (108x108)')

  // adaptive icon XML
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`)
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`)

  // background color resource
  const valuesDir = path.join(ANDROID_RES, 'values')
  const colorsXml = path.join(valuesDir, 'colors.xml')
  let colorsContent = ''
  if (fs.existsSync(colorsXml)) {
    colorsContent = fs.readFileSync(colorsXml, 'utf-8')
  } else {
    colorsContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
</resources>`
  }
  if (!colorsContent.includes('ic_launcher_background')) {
    colorsContent = colorsContent.replace('</resources>', '    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>')
    fs.writeFileSync(colorsXml, colorsContent)
  }

  console.log('Done! All Android icons generated from Logo.jpg')
}

main().catch(console.error)
