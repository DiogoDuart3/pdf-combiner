// app/api/combine-pdfs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PageSizes } from 'pdf-lib'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData()
  const files = formData.getAll('file') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  try {
    const pdfDoc = await PDFDocument.create()

    // Define the layout for 4 PDFs per page
    const layout = [
      { x: 0, y: PageSizes.A4[1] / 2, width: PageSizes.A4[0] / 2, height: PageSizes.A4[1] / 2 },
      { x: PageSizes.A4[0] / 2, y: PageSizes.A4[1] / 2, width: PageSizes.A4[0] / 2, height: PageSizes.A4[1] / 2 },
      { x: 0, y: 0, width: PageSizes.A4[0] / 2, height: PageSizes.A4[1] / 2 },
      { x: PageSizes.A4[0] / 2, y: 0, width: PageSizes.A4[0] / 2, height: PageSizes.A4[1] / 2 },
    ]

    let currentPage = pdfDoc.addPage(PageSizes.A4)
    let layoutIndex = 0

    const scale = 0.5; // Define the scale factor

    for (const file of files) {
      const pdfBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(pdfBytes)
      const [firstPage] = await pdfDoc.copyPages(pdf, [0]) // Copy only the first page of each PDF
      const embeddedPage = await pdfDoc.embedPage(firstPage) // Embed the page

      currentPage.drawPage(embeddedPage, { // Use the embedded page
        x: layout[layoutIndex].x,
        y: layout[layoutIndex].y,
        width: firstPage.getWidth() * scale,
        height: firstPage.getHeight() * scale,
      })

      layoutIndex++

      // If we've placed 4 PDFs, start a new page
      if (layoutIndex === 4 && files.indexOf(file) !== files.length - 1) {
        currentPage = pdfDoc.addPage(PageSizes.A4)
        layoutIndex = 0
      }
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=combined.pdf',
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error combining PDFs' }, { status: 500 })
  }
}