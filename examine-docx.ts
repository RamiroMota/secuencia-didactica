import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function examineDocx(filename: string) {
  try {
    console.log(`\nExamining ${filename}...`)
    
    // Check if file exists
    if (!fs.existsSync(filename)) {
      console.log("File not found")
      return
    }
    
    const stats = fs.statSync(filename)
    console.log(`File size: ${stats.size} bytes`)
    
    // Try to extract the DOCX (which is a ZIP file)
    const extractDir = `extracted-${filename.replace('.docx', '')}`
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir)
    }
    
    // Extract the ZIP file
    await execAsync(`unzip -o "${filename}" -d "${extractDir}"`)
    
    // Check the XML files
    const wordDir = path.join(extractDir, "word")
    if (fs.existsSync(wordDir)) {
      console.log("Word directory found")
      
      // Check document.xml
      const documentXmlPath = path.join(wordDir, "document.xml")
      if (fs.existsSync(documentXmlPath)) {
        const content = fs.readFileSync(documentXmlPath, "utf-8")
        console.log(`document.xml size: ${content.length} characters`)
        
        // Check for common issues
        if (content.includes("&amp;") && !content.includes("&amp;amp;")) {
          console.log("XML escaping looks correct")
        } else if (content.includes("&amp;amp;")) {
          console.log("WARNING: Double escaping detected")
        }
        
        // Check for invalid characters
        const invalidChars = /[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/
        if (invalidChars.test(content)) {
          console.log("WARNING: Invalid XML characters detected")
        } else {
          console.log("No invalid XML characters found")
        }
      }
    }
    
    console.log("Examination complete")
    
  } catch (error) {
    console.error("Error examining DOCX:", error)
  }
}

async function main() {
  const files = [
    "test-basic.docx",
    "test-table.docx",
    "test-special-chars.docx",
    "test-floating-image.docx",
    "test-full-no-qr.docx",
    "test-full-with-qr.docx",
  ]
  
  for (const file of files) {
    await examineDocx(file)
  }
}

main()