declare var svg4everybody: any;
declare var svgPanZoom: any;
declare var jQuery: any;

import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { PDFPanel } from './component/pdfpanel/pdf.panel.component';
import { PDFWorkmat } from './component/pdfworkmat/pdf.workmat.component';
import { PDFControls } from './component/pdfcontrols/pdf.controls.component';
import { MXGameCommon } from '../shared/libs/mxgame.common';
import { LocalConnectService } from '../shared/libs/services/local.connect.service';
import { DPService } from '../shared/libs/services/dp.service';
import { GLBObj, PDFService } from './shared/pdf.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends MXGameCommon.Types.SVGGameingBase {

  @ViewChild(PDFPanel) pdfPanel: PDFPanel;
  @ViewChild(PDFWorkmat) pdfWorkmat: PDFWorkmat;
  @ViewChild(PDFControls) pdfControls: PDFControls;

  mode: string;
  grade: string;
  pdf: string = '';
  title: string = '';
  ccw:boolean = false;
  assetsLoadTimer: any;
  appSmallName: string;
  lastAction:string;
  pages: any;
  allowOnce:boolean = true;
  globalDtActiveStatus:boolean = false;
  parentInstance:any;
  private server:string;

   constructor(private lcService: LocalConnectService.LocalConnect, private dataOfPDF: PDFService.DataOfPDF, private pagesOfPDF:PDFService.PagesOfPDF) {
    super(null, null);
    this.parentInstance = this;
    Object(document).self = this;
  }

  ngOnInit() {
    svg4everybody();
    Object(document).self = this;

    /********************************DR STARTS********************************/
    var thiS = this;
    var gradesShort = ['gk', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
    var urlString: string = window.location.href;////Use this for testing in local */'https://www-review-k6.thinkcentral.com/content/hsp/math/mx2018/na/grk/daily_routines_9781328787187_/index.html#login=valid&mode=dr';
    var urlParam: any = DPService.getUrlParam(urlString);
    console.log('urlParam =', urlParam);

    var appShortName: string;
    var casStorage: boolean;
    var browserStorage: boolean;

    this.server = DPService.identifyServer(urlString);

    if (urlParam) {
      if(urlParam.grade && typeof urlParam.grade==='string' && gradesShort.indexOf(urlParam.grade)!==-1){
        this.grade = urlParam.grade;
      }else if(urlParam.user && typeof urlParam.user==='string' && gradesShort.indexOf(urlParam.user)!==-1){
        this.grade = urlParam.user;
      }else{
        this.grade = 'gk';
      }
      this.mode = (urlParam.mode && typeof urlParam.mode === 'string' && urlParam.mode === 'dr') ? urlParam.mode : 'standalone';
      this.pdf = (urlParam.pdf && typeof urlParam.pdf === 'string' && urlParam.pdf !== '') ? urlParam.pdf : 'pdfnotfound.pdf';
      this.pages = (urlParam.pages && typeof urlParam.pages === 'string' && urlParam.pages !== '') ? urlParam.pages : [1];
      this.title = (urlParam.title && typeof urlParam.title === 'string' && urlParam.title !== '') ? urlParam.pdf : '';
      this.ccw = (urlParam.ccw && typeof urlParam.ccw === 'string' && (urlParam.ccw === 'true' || urlParam.ccw === 'false')) ? JSON.parse(urlParam.ccw) : false;
    } else {
      this.grade = 'gk';
      this.mode = 'standalone';
      this.pdf = 'pdf-sample-more.pdf';
      this.pages = "1-10";
      this.title = '';
      this.ccw = false;
    }
    /*Configure pdf with extension*/
    ((this.pdf).indexOf('.pdf') === -1) ? this.pdf = this.pdf + '.pdf' : this.pdf;
    /*Configure pdf with file path*/
    if(this.mode && typeof this.mode==='string' && this.mode==='dr' && this.grade && this.grade==='g1' && (this.pdf).indexOf('/') === -1){
      this.pdf = '../../../../../mx2018/na/gr1/teacher_resource_book_9781328786425_/pdfs/' + this.pdf;
    }else if(this.mode && typeof this.mode==='string' && this.mode==='dr' && this.grade && this.grade==='g2' && (this.pdf).indexOf('/') === -1){
      this.pdf = '../../../../../mx2018/na/gr2/teacher_resource_book_9781328786432_/pdfs/' + this.pdf;
    }else if((this.pdf).indexOf('/') === -1){
      this.pdf = 'assets/pdf/' + this.pdf;
    }else{
      this.pdf = this.pdf;
    }
    console.log('PDF file with path =>',this.pdf);
    /**Configure Pages Data to array */
    this.pages = this.pagesOfPDF.getPages(this.pages);

    if (urlParam && urlParam.mode && urlParam.mode === 'dr') {
      appShortName = 'dr_pdf_' + this.grade;
      casStorage = true;
      browserStorage = true;
    } else {
      appShortName = 'pdf_' + this.grade;
      casStorage = false;
      browserStorage = false;
    }
    GLBObj.appShortName = this.appSmallName = appShortName;
    GLBObj.grade = this.grade;
    GLBObj.mode = this.mode;
    GLBObj.pdf = this.pdf;
    GLBObj.title = this.title;
    GLBObj.ccw = this.ccw;
    GLBObj.pages = this.pages;
    GLBObj.isIeBrowser = DPService.detectIE();

    //console.log('appShortName =', appShortName, '\ncasStorage =', casStorage, '\nbrowserStorage =', browserStorage);
    /********************************DR ENDS********************************/
  }
 

  ngAfterViewInit() {
    /********************************DR STARTS********************************/
    jQuery('#side-button-holder').hide();

    this.assetsLoadTimer = setInterval(function () {
      jQuery(".loading-div").show();
    }, 10);
    if (this.lcService.verify('wrapApp')) {
      this.lcService.receive('wrapApp', (res: any)=>{
        this.lastAction = (res === null || res === undefined) ? '' : res;
        //this.startUndoRedo(this.appSmallName, this.lastAction);
      });
    } else {
      this.lastAction = '';
      //this.startUndoRedo(this.appSmallName, this.lastAction);
    }
    /********************************DR ENDS********************************/
  }

  /**For Global DT Begins*/
  saveStageFromDTTriggered(event: Event) {
    var obj: any = {};
    var thiS:any = Object(document).self;
    obj = event;
    if (obj['activeStatus']) {
      thiS._copyStageView();
    }
  }
  paletteTriggered(event: Event) {
    var obj:any = {};
    obj = event;
    if(obj['activeStatus']){
      this.globalDtActiveStatus = true;
    }else{
      this.globalDtActiveStatus = false;
    }
  }
  /**For Global DT Ends*/

  startUndoRedo(appShortName: string, lastAction: string) {
    var thiS: any = this;
    clearInterval(thiS.assetsLoadTimer);
    if (jQuery('body').attr('data') === undefined || jQuery('body').attr('data') === 'assetsdone') {
      jQuery(".loading-div").fadeOut(400);
    } else {
      jQuery(".loading-div").show();
    }
    thiS._initUR(appShortName, lastAction, {//send the variable to UNDOREDO class through the object.
      ready: thiS.undoRedoReady,
      updateEvents: thiS.updateAllEvents,
      updateOnAction: thiS.updateAllAction,
      storeAction: thiS.storeDataToDP,
      workmatClean: true,
      clearAllBtnControl: false
    });
    (this.mode === 'dr') ? jQuery('#side-button-holder').hide():setTimeout(()=>(jQuery('#side-button-holder').fadeIn(300)),1000);
    this.lcService.trigger('appLoadInsideModalIsReady',{appShortName:'pdf', callback:this._copyStageView, scope:this, width:'100%', height:'100%'});
  }
  undoRedoReady() {
    //test run
    //(jQuery('#'+this.workmatId).html()==='')?jQuery('#'+this.workmatId).html('<rect x="0" y="0" width="30" height="30" stroke="black" fill="white" stroke-width="1"/>'):'';
  }
  updateEvents() {

  }
  updateAllAction() {

  }
  storeDataToDP(obj:any) {
    if(this.allowOnce){
      this.allowOnce = false;
      setTimeout(()=>{
        this.lcService.trigger('storeDataTrigger', obj);
      },1000);
    }else{
      this.lcService.trigger('storeDataTrigger', obj);
    }
  }
  triggerFromPdfPanel(res: any) {
    var obj:any = (res && res.data)?res.data:null;
    if (res && res.event && typeof res.event === 'string' && res.event !== '') {
      switch (res.event) {
        case 'pdfReady':
          this.pdfControls.initPdfControls(obj);
          this.pdfWorkmat.initWorkmat(obj);
          break;
        case 'pdfUpdate':
          //this.pdfControls.initPdfControls(obj);
          this.pdfWorkmat.updateWorkmat(obj);
          break;
      }
    }
  }
  triggerFromPdfControl(res: any) {
    var obj:any = (res && res.data)?res.data:null;
    if (res && res.event && typeof res.event === 'string' && res.event !== '') {
      switch (res.event) {
        case 'enablePanning':
          this.pdfWorkmat.enablePanning();
          break;
        case 'disablePanning':
          this.pdfWorkmat.disablePanning();
          break;
        case 'loadPagePrev':
          this.pdfPanel.loadPagePrev(obj);
          break;
        case 'loadPageNext':
          this.pdfPanel.loadPageNext(obj);
          break;
        case 'loadPageByPageNo':
          this.pdfPanel.loadPageByPageNo(obj);
          break;
        case 'movePageToggle':
          this.pdfPanel.movePageToggle();
          break;
        case 'turnPageHorizontalVertical':
          this.pdfPanel.turnPageHorizontalVertical(obj);
          break;
        case 'zoomInPage':
          this.pdfPanel.zoomInPage(obj);
          break;
        case 'zoomOutPage':
          this.pdfPanel.zoomOutPage(obj);
          break;
      }
    }
  }
  triggerFromPdfWorkmat(res: any){
    if (res && res.event && typeof res.event === 'string' && res.event !== '') {
      switch (res.event) {
        case 'panZoomReady':
          this.startUndoRedo(this.appSmallName, this.lastAction);
          break;
      }
    }
  }
} 
