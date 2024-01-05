import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class DownloadPdfExcelService {

  constructor() { }

  downLoadPdf(header: any, values: any, objData: any) {
    let doc: any = new jsPDF();
    doc.autoTable(header, values, {
      startY: 25,
      rowPageBreak: 'avoid',
      // margin: { horizontal: 7 , verticle: 10},
      margin: { horizontal: 10, top: 25 },

      didDrawPage: function (_data: any) {
        // var imgWidth = 33;
        // var height = 20;
        // doc.addImage('../../../../assets/images/.jpeg', 'JPEG', 2, -3, imgWidth, height); //add image

        doc.setFontSize(13);
        doc.text(objData.topHedingName, 100, 8, "center");

        if (objData?.timePeriod != null) {
          doc.setFontSize(8);
          doc.text(objData.timePeriod, 11, 14, "left");
        }

        if (objData.name) {
          doc.setFontSize(8);
          doc.text(objData?.name, 12, 14, "left");
        }

        doc.setFontSize(8);
        doc.text(objData.createdDate, 200, 14, "right");

        doc.setLineWidth(0.2);
        doc.line(12, 15, 200, 15);

        doc.setLineWidth(0.2);
        doc.line(12, 286, 200, 286);

        doc.setFontSize(8);
        doc.text('Note:This is a system generated File.', 200, 290, "right");

      }
    });

    doc.save(objData.topHedingName);
  }

  generateExcel(keyData: any, apiKeys: any, data: any, name: any, headerKeySize?: any) {
    // console.log("keyData: ", keyData);
    // console.log("apiKeys: ", apiKeys);
    // console.log("data: ", data);
    // console.log("name: ", name);
    // console.log("headerKeySize: ", headerKeySize);

    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(name[0].sheet_name);

    //Add Row and formatting
    worksheet.mergeCells('C2', 'F5');
    //  worksheet.mergeCells('C5', 'F8');

    let titleRow = worksheet.getCell('C2');
    titleRow.value = name[0].title;
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '3208' },
    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('C1:F1');
    let heading = worksheet.getCell('C1');
    heading.value = (name[0].languageFlag == 'English' ? 'School Level Response Record Table ' : 'शाळास्तर प्रतिसाद नोंद तक्ता ') + (name[0].standard == '' ? '' : (name[0].languageFlag == 'English' ? '(Standard ' : '(इयत्ता  ') + name[0].standard + ')');
    heading.font = { name: 'Calibri', size: 14, bold: true, color: { argb: '0000' } };
    heading.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A6:C6');
    let districtName = worksheet.getCell('A6');
    districtName.value = (name[0].languageFlag == 'English' ? 'District: ' : 'जिल्हा: ') + name[0].district;
    districtName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    districtName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('E6:F6');
    let talukaName = worksheet.getCell('E6');
    talukaName.value = (name[0].languageFlag == 'English' ? 'Taluka: ' : 'तालुका: ') + name[0].taluka;
    talukaName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    talukaName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('G6:H6');
    let centerName = worksheet.getCell('G6');
    centerName.value = (name[0].languageFlag == 'English' ? 'Center: ' : 'केंद्र: ') + name[0].center;
    centerName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    centerName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('A7:C7');
    let villageName = worksheet.getCell('A7');
    villageName.value = (name[0].languageFlag == 'English' ? 'Village: ' : 'गाव: ') + name[0].village;
    villageName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    villageName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('E7:F7');
    let schoolName = worksheet.getCell('E7');
    schoolName.value = (name[0].languageFlag == 'English' ? 'School Name: ' : 'शाळेचे नाव: ') + name[0].schoolName;
    schoolName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    schoolName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('G7:H7');
    let assessmentT = worksheet.getCell('G7');
    assessmentT.value = (name[0].languageFlag == 'English' ? 'Assessment Type: ' : 'मूल्यांकन प्रकार: ') + name[0].assessmentType;
    assessmentT.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    assessmentT.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('A8:C8');
    let examT = worksheet.getCell('A8');
    examT.value = (name[0].languageFlag == 'English' ? 'Exam Type: ' : 'परीक्षेचा प्रकार: ') + name[0].examType;
    examT.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    examT.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('E8:F8');
    let academicYear = worksheet.getCell('E8');
    academicYear.value = (name[0].languageFlag == 'English' ? 'Academic Year: ' : 'शैक्षणिक वर्ष: ') + name[0].academicYear;
    academicYear.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    academicYear.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('G8:H8');
    let date = worksheet.getCell('G8');
    date.value = (name[0].languageFlag == 'English' ? 'Date: ' : 'तारीख: ') + name[0].date;
    date.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    date.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('G9:H9');
    let preTestCount = worksheet.getCell('G9');
    preTestCount.value = (name[0].languageFlag == 'English' ? 'Pre Test Count: ' : 'पूर्व चाचणी घेतलेल्या विद्यार्थ्यांची संख्या : ') + name[0].studentCount.preTestCount;
    preTestCount.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    preTestCount.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('G10:H10');
    let finalTestCount = worksheet.getCell('G10');
    finalTestCount.value = (name[0].languageFlag == 'English' ? 'Final Test Count: ' : 'अंतिम चाचणी  घेतलेल्या विद्यार्थ्यांची संख्या : ') + name[0].studentCount.finalTestCount;
    finalTestCount.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    finalTestCount.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('E9:F9');
    let totalCount = worksheet.getCell('E9');
    totalCount.value = (name[0].languageFlag == 'English' ? 'Total Student Count: ' : 'एकूण विद्यार्थी संख्या : ') + name[0].studentCount.exam_StudCount;
    totalCount.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    totalCount.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('A9:C9');
    if (name[0].assessmentType == 'Class Wise' || name[0].assessmentType == 'इयत्ता निहाय') {
      let subject = worksheet.getCell('A9');
      subject.value = (name[0].languageFlag == 'English' ? 'Subject: ' : 'विषय : ') + name[0].subject;
      subject.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
      subject.alignment = { vertical: 'middle', horizontal: 'left' };
    }
    else if (name[0].assessmentType == 'Base Level' || name[0].assessmentType == 'पायाभूत स्तर') {
      let groupOfClass = worksheet.getCell('A9');
      groupOfClass.value = (name[0].languageFlag == 'English' ? 'Group of Class: ' : 'वर्ग गट : ') + name[0].groupOfClass;
      groupOfClass.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
      groupOfClass.alignment = { vertical: 'middle', horizontal: 'left' };
    }

    worksheet.mergeCells('A10:C10');
    let standard = worksheet.getCell('A10');
    standard.value = (name[0].languageFlag == 'English' ? 'Standard: ' : 'इयत्ता : ') + name[0].standard;
    standard.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    standard.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.addRow([]);  // Blank Row

    const headerRow = worksheet.addRow(keyData); // Add Header Row

    let result: any = data.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < apiKeys.length; i++) {
        filterObj[apiKeys[i]] = obj[apiKeys[i]];
      }
      return filterObj;
    });

    headerRow.eachCell((cell: any) => { // Cell Style : Fill and Border
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' }, bgColor: { argb: 'C0C0C0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });


    // var headerSize = [7, 15, 20, 15, 14, 60, 40, 10, 10, 15, 40, 10, 18, 10, 10, 10, 10, 15, 15, 7, 8];

    for (var i = 0; i < headerKeySize.length; i++) {
      worksheet.getColumn(i + 1).width = headerKeySize[i];
    }

    // Add Data
    result.map((d: any) => {
      worksheet.addRow(Object.values(d));
    });

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, name[0].excel_name);

    });
  }


  // chool wise report 

  generateExcelSchool(keyData: any, apiKeys: any, data: any, name: any) {
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(name[0].sheet_name);

    //Add Row and formatting
    worksheet.mergeCells('C2', 'F5');
    let titleRow = worksheet.getCell('C2');
    titleRow.value = name[0].title;
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '3208' },

    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

    //filter
    worksheet.mergeCells('A6:C6');
    let talukaName = worksheet.getCell('A6');
    talukaName.value = (name[0].languageFlag == 'English' ? 'Taluka: ' : 'तालुका: ') + name[0].taluka;
    talukaName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    talukaName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('E6:F6');
    let centerName = worksheet.getCell('E6');
    centerName.value = (name[0].languageFlag == 'English' ? 'Center: ' : 'केंद्र: ') + name[0].center;
    centerName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0000' } };
    centerName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.addRow([]);  // Blank Row

    const headerRow = worksheet.addRow(keyData); // Add Header Row

    let result: any = data.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < apiKeys.length; i++) {
        filterObj[apiKeys[i]] = obj[apiKeys[i]];
      }
      return filterObj;
    });

    headerRow.eachCell((cell: any) => { // Cell Style : Fill and Border
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' }, bgColor: { argb: 'C0C0C0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = {
        vertical: 'middle', horizontal: 'center'
      };
      // cell.alignment = {alignment: { vertical: 'middle', horizontal: 'right' }}
    });

    var headerSize = [7, 15, 20, 70, 14, 40, 40, 40];

    for (var i = 0; i < headerSize.length; i++) {
      worksheet.getColumn(i + 1).width = headerSize[i];
    }

    // Add Data
    result.map((d: any) => {
      const dataStyle = worksheet.addRow(Object.values(d));
      dataStyle.eachCell((cell: any) => {
        cell.font = {
          align: 'left'
        };
        cell.alignment = {
          vertical: 'middle', horizontal: 'center'
        };
      })
    });

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {

      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, name[0].excel_name);

    });
  }


  // common excel function 
  async allGenerateExcel(keyData: any, ValueData: any, objData: any, headerKeySize?: any) {
    
    // 1:keyHeader,2:values,3:Data-heading time date ,4:column size width
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(objData.topHedingName);

    worksheet.addRow([]);
    worksheet.getCell('C4').value = objData.topHedingName
    worksheet.getCell('C4').font = { name: 'Calibri', family: 3, size: 13, bold: true, };

    if (objData?.timePeriod != null) {
      worksheet.getCell('C5').value = objData.timePeriod
      worksheet.getCell('C5').font = { name: 'Calibri', family: 3, size: 13, bold: true, };
    }

    worksheet.getCell('E5').value = objData.createdDate
    worksheet.getCell('E5').font = { name: 'Calibri', family: 3, size: 12, bold: true, };

    if (objData.name) {
      worksheet.mergeCells('A6', 'B6');
      worksheet.getCell('A6').value = objData.name
      worksheet.getCell('A6').font = { name: 'Calibri', family: 3, size: 12, bold: true, };
    }

    //  const response = await fetch('../../../../assets/images/samadhanLogo.jpeg');
    //  const buffer = await response.arrayBuffer();
    //  const imageId1 = workbook.addImage({
    //    buffer: buffer, extension: 'jpeg',
    //  });

    //  worksheet.addImage(imageId1, 'B1:B5');


    worksheet.addRow([]);// Blank Row
    const headerRow = worksheet.addRow(keyData); // Add Header Row

    headerRow.eachCell((cell) => { // Cell Style : Fill and Border
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' }, bgColor: { argb: 'C0C0C0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    for (var i = 0; i < headerKeySize.length; i++) {
      worksheet.getColumn(i + 1).width = headerKeySize[i];
    }

    // Add Data and Conditional Formatting
    ValueData.forEach((d: any) => {
      let row = worksheet.addRow(d); row
    });

    worksheet.addRow([]);

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, objData.topHedingName);
    });
  }

  // Officer Visit Report
  downloadExcelTable(keyData:any, apiKeys:any, tableData:any, subKeyData:any, subApiKeys:any, pageName?: any, headerSize?: any){
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(pageName);
    const headerRow = worksheet.addRow(keyData); 
    headerRow.eachCell((cell: any) => { 
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' }, bgColor: { argb: 'C0C0C0' } };
      cell.border = { top: { style: 'sol' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, color: {argb:'000000'} };
      cell.font = { bold: true, color: {argb: '000000'}},
      cell.alignment = {horizontal: 'center'}
    });
    var headerSize = headerSize;
    for (var i = 0; i < headerSize.length; i++) {
      worksheet.getColumn(i + 1).width = headerSize[i];
    }

    tableData.forEach((element: any) => {
      const eachRow: any = [];
      apiKeys.forEach((column: any) => {
        (element[column]?.length == 0 || element[column] == null) ?element[column]='N/A': element[column];
         eachRow.push(element[column]);
      })
      let dataRow = worksheet.addRow(eachRow);
      dataRow.eachCell((cell: any) => { 
        cell.border = { top: { style: 'sol' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, color: {argb:'000000'} };
        cell.alignment = {horizontal: 'left'}
      });

      if(element.officerVisitSchools?.length > 0){
        const headerRow = worksheet.addRow(subKeyData); 
        headerRow.eachCell((cell: any) => { 
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8E8E8' }, bgColor: { argb: 'E8E8E8' } };
          cell.border = { top: { style: 'sol' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, color: {argb:'000000'} };
          cell.font = { bold: true, color: {argb: '000000'}},
          cell.alignment = {horizontal: 'center'}
        });

        element.officerVisitSchools?.forEach((ele: any) => {
          const subEachRow: any = [];
          subApiKeys.forEach((col: any) => {
            (ele[col]?.length== 0 || ele[col] == null) ?ele[col]='N/A': ele[col];
            subEachRow.push(ele[col]);
          })
        
          let subDataRow = worksheet.addRow(subEachRow);
          subDataRow.eachCell((cell: any) => { 
            cell.border = { top: { style: 'sol' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, color: {argb:'000000'} };
            cell.alignment = {horizontal: 'left'}
          });
        })
      }
      worksheet.addRow([])
    })
    
     // Generate Excel File with given name
     workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, pageName);
    });
  }




}
