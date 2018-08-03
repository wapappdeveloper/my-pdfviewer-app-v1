import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
//import { MXGameCommon } from '../../../shared/libs/mxgame.common';
import { GLBObj, PDFService } from '../../shared/pdf.service';
import { PanZoomService } from '../../shared/panzoom.service';
import { PanningService } from '../../shared/panning.service';
import { DomSanitizer } from '@angular/platform-browser';

declare var jQuery: any;
declare var svg4everybody: any;
declare var svgPanZoom: any;

@Component({
    selector: 'pdf-workmat',
    templateUrl: './pdf.workmat.component.html',
    providers: [PDFService.DataOfPDF, PanZoomService, PanningService]
})
export class PDFWorkmat {

    @Output() emitFromPdfWorkmat = new EventEmitter();

    @Input() private parentInstance:any;

    loopElem:any = new Array(100);
    rotateDeg:number = 0;
    rotatePlus90Degree:boolean = false;
    rotateMinus90Degree:boolean = false;
    panZoomInitiated:boolean = false;
    transformOrigin:any;
    positionStyle:string = 'relative';
    leftStyle:number = 0;

    workmatScrollTop:number     = 0;
    workmatScrollLeft:number    = 0;
    workmatOffsetTop:number     = 0;
    workmatOffsetLeft:number    = 0;

    viewerContainerWidth:number     = 1024;
    viewerContainerHeight:number    = 672;
    viewerWidth:number              = 1016;
    viewerHeight:number             = 672;
    workmatWidth:number             = 1024;
    workmatHeight:number            = 704;
    alignLeftWorkmat:number         = 0;
    viewerTopPosition:number        = 0;
    currentScaleValue:number        = 0;

    panZoomInstance:any;
    zoomScale:number = 0.4;
    zoomMinScale:number = 1;
    zoomMaxScale:number = 3;

    mouseDownX:number = null;
    mouseDownY:number = null;
    mouseDown:boolean = null;
    mouseMoveX:number = null;
    mouseMoveY:number = null;
    mouseMove:boolean = null;
    mouseUpX:number = null;
    mouseUpY:number = null;
    mouseUp:boolean = null;

    mouseDownScrollTop:number = null;
    mouseDownScrollLeft:number = null;
    mouseMoveScrollTop:number = null;
    mouseMoveScrollLeft:number = null;
    pinchZoom:boolean=true;

    allowOnce:boolean = true;

    constructor(private dataOfPDF: PDFService.DataOfPDF, private panZoom: PanZoomService, private panning: PanningService, private domSanitizerService:DomSanitizer){
    }
    ngOnInit() {
        
    }
    initWorkmat(dimension:any={
        viewerContainerWidth:1024,
        viewerContainerHeight:672,
        viewerWidth:1016,
        viewerHeight:672,
        initialPageWidth:546,
        initialPageHeight:834,
        initialPageOffsetTop:0,
        initialPageOffsetLeft:0,
        scrollTop:0,
        scrollLeft:0,
        offsetTop:0,
        offsetLeft:0,
        zoomValue:1,
        initialPageNumber:1
    }){
        //console.log('initWorkmat',dimension);
        this.viewerContainerWidth     = dimension.viewerContainerWidth;
        this.viewerContainerHeight    = dimension.viewerContainerHeight;
        this.viewerWidth              = dimension.viewerWidth;
        this.viewerHeight             = dimension.viewerHeight;
        this.workmatWidth             = dimension.initialPageWidth;
        this.workmatHeight            = dimension.viewerHeight;
        this.viewerTopPosition        = dimension.viewerTopPosition;
        this.rotatePlus90Degree       = dimension.rotatePlus90Degree,
        this.rotateMinus90Degree      = dimension.rotateMinus90Degree,
        this.currentScaleValue        = dimension.currentScaleValue;
        this.transformOrigin          = dimension.transformOrigin;
        this.positionStyle            = dimension.positionStyle;
        this.leftStyle                = dimension.leftStyle;
        this.updateScrollOfWorkmat(dimension);
        //this.initiatePanzoomToWorkmat();
        this.showWorkmat();
        this.setViewBoxValue(this.workmatWidth, this.workmatHeight);
        (!this.panZoomInitiated)?this.emitFromPdfWorkmat.emit({event:'panZoomReady'}):'';
    }
    updateWorkmat(dimension:any={
        viewerContainerWidth:1024,
        viewerContainerHeight:672,
        viewerWidth:1016,
        viewerHeight:672,
        initialPageWidth:546,
        initialPageHeight:834,
        initialPageOffsetTop:0,
        initialPageOffsetLeft:0,
        scrollTop:0,
        scrollLeft:0,
        offsetTop:0,
        offsetLeft:0,
        zoomValue:1,
        initialPageNumber:1
    }){
        //console.log('updateWorkmat',dimension);
        this.viewerContainerWidth     = dimension.viewerContainerWidth;
        this.viewerContainerHeight    = dimension.viewerContainerHeight;
        this.viewerWidth              = dimension.viewerWidth;
        this.viewerHeight             = dimension.viewerHeight;
        this.workmatWidth             = dimension.initialPageWidth;
        this.workmatHeight            = dimension.viewerHeight;
        this.viewerTopPosition        = dimension.viewerTopPosition;
        this.rotatePlus90Degree       = dimension.rotatePlus90Degree,
        this.rotateMinus90Degree      = dimension.rotateMinus90Degree,
        this.currentScaleValue        = dimension.currentScaleValue;
        this.transformOrigin          = dimension.transformOrigin;
        this.positionStyle            = dimension.positionStyle;
        this.leftStyle                = dimension.leftStyle;
        this.updateScrollOfWorkmat(dimension);
        (this.panZoomInitiated)?this.updatePanZoomToWorkmat():'';
        this.showWorkmat();
    }
    initiatePanzoomToWorkmat(){
        this.panZoomInitiated = true;
        this.panZoom.initPanZoom('stage', ()=>{
            this.panZoomReady();
        });
    }
    panZoomReady(){
        this.emitFromPdfWorkmat.emit({event:'panZoomReady'});
        this.updatePanZoomToWorkmat();
    }
    enablePanning(){
        this.panning.initPanning('pdf-workmat-area');
        this.pinchZoom=true;
    }
    disablePanning(){
        this.panning.clear('pdf-workmat-area');
        this.pinchZoom=false;
    }
    updatePanZoomToWorkmat(){
        var currentZoomValue:number = this.currentScaleValue;
        this.panZoom.setZoom(currentZoomValue);
    }
    updateScrollOfWorkmat(dimension:any=null){
        var obj:any;
        setTimeout(()=>{
            obj = (dimension)?dimension:console.error('error in dimension');
                jQuery('#pdf-workmat-area').scrollTop(obj.scrollTop).scrollLeft(obj.scrollLeft);
                jQuery('#pdf-workmat-area').scroll(function(){
                    jQuery('#pdf-panel-area').scrollTop(jQuery(this).scrollTop()).scrollLeft(jQuery(this).scrollLeft());
                });
        },0);
    }
    setViewBoxValue(width:number, height:number){
        var shape:any = document.getElementById("stage");
        shape.setAttribute("viewBox", "0 0 "+ width +" "+height);
    }
    showWorkmat(){
        jQuery('#pdf-workmat-area').css({'opacity':'1'});
        //jQuery('#pdf-workmat-area').css({'display':'none'});
    }
} 
