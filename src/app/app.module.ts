import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { PDFControls } from './component/pdfcontrols/pdf.controls.component';
import { PDFPanel } from './component/pdfpanel/pdf.panel.component';
import { PDFWorkmat } from './component/pdfworkmat/pdf.workmat.component';

import { LocalConnectService } from '../shared/libs/services/local.connect.service';
import { PDFService } from './shared/pdf.service';


@NgModule({
  declarations: [
    AppComponent,
    PDFControls,
    PDFPanel,
    PDFWorkmat
  ],
  imports: [
    BrowserModule
  ],
  providers: [LocalConnectService.LocalConnect, PDFService.DataOfPDF, PDFService.PagesOfPDF],
  bootstrap: [AppComponent]
})
export class AppModule { }
