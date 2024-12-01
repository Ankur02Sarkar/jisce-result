import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rollNumber = searchParams.get("rollNumber");
  const examId = searchParams.get("examId");

  if (!rollNumber || !examId) {
    return NextResponse.json(
      { error: "Missing rollNumber or examId" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `http://jisexams.in:8080/IEMISReports_JISU/run?__report=RPP_V5/RPPViewResultStudent.rptdesign&CID=003&prnno=${rollNumber}&Examscheduleid=${examId}&processlevelid=1&__format=pdf&__asattachment=true`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="exam_result_${examId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
  }
}
