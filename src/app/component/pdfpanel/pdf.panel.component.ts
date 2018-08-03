import { Component, Output, Input, EventEmitter} from '@angular/core';
import 'rxjs/Rx';
import { GLBObj, PDFService } from '../../shared/pdf.service';
import { DomSanitizer } from '@angular/platform-browser';


declare var jQuery: any;
declare var PDFJS: any;

@Component({
    selector: 'pdf-panel',
    templateUrl: './pdf.panel.component.html',
    providers: [PDFService.DataOfPDF]
})
export class PDFPanel {

    @Output() emitFromPdfPanel = new EventEmitter();

    @Input() private parentInstance:any;

    workerjsPath:string = 'scripts.d6fd071c27cc7ca45719.bundle.js';

    filename:string;
    title:string;
    pages:any = [];

    initialPageNumber:number = 1;
    totalPageNumber:number = 0;
    currentPageNumber:number = 1;
    initialScaleValue:number;
    currentScaleValue:number;
    initialAngle:number = 0;
    currentAngle:number = 0;
    allowOnce:boolean = true;
    transformOrigin:any;
    positionStyle:string = 'relative';
    leftStyle:number = 0;

    pdfFile:any = {};
    pdfPages:any = [];
    
    initialCanvasWrapperWidth:number = 1024;
    initialCanvasWrapperHeight:number = 0;

    currentViewerContainerWidth:number = 0;
    currentViewerContainerHeight:number = 0;

    currentViewerWidth:number = 0;
    currentViewerHeight:number = 0;

    currentCanvasWrapperWidth:number = 0;
    currentCanvasWrapperHeight:number = 0;

    viewerTopPosition:number = 0;
    rotateDeg:number = 0;
    rotatePlus90Degree:boolean = false;
    rotateMinus90Degree:boolean = false;

    constructor(private dataOfPDF: PDFService.DataOfPDF, private domSanitizerService: DomSanitizer){
        
    }

    ngOnInit(){
        (GLBObj && GLBObj.pdf && typeof GLBObj.pdf==='string' && GLBObj.pdf!=='')?this.filename=GLBObj.pdf:this.filename='pdfnotfound.pdf';
        (GLBObj && GLBObj.title && typeof GLBObj.title==='string' && GLBObj.title!=='')?this.title=GLBObj.title:this.title='PDF Title';
        (GLBObj && GLBObj.pages && typeof GLBObj.pages==='object')?this.pages=GLBObj.pages:this.pages=[1];
        this.rotateDeg = (GLBObj.ccw)?-90:90;
        console.log(GLBObj.ccw);
        this.totalPageNumber = this.pages.length;
        this.transformOrigin = this.domSanitizerService.bypassSecurityTrustStyle('0% 0%');
    }

    ngAfterViewInit(){
        //console.log(this.filename, this.title, this.pages);
        this.loadPDFByInternallyAsCanvas(this.filename, this.title, this.pages);
    }

    loadPDFByInternallyAsCanvas(getPdfName:string, getPdfTitle:string, getPdfPages?:any){
        if (!(Object(window).requestAnimationFrame)) {
            Object(window).requestAnimationFrame = (function() {
            return Object(window).webkitRequestAnimationFrame ||
                Object(window).mozRequestAnimationFrame ||
                Object(window).oRequestAnimationFrame ||
                Object(window).msRequestAnimationFrame ||
                function(callback:Function, element:any) {
                    Object(window).setTimeout(callback, 1000 / 60);
                };
            })();
        }
        PDFJS.disableStream = true;
        PDFJS.workerSrc = this.workerjsPath;
        PDFJS.getDocument(getPdfName).then((pdfFile:any)=>{
            this.pdfFile = pdfFile;
            this.renderPdfIntoPages(pdfFile, getPdfPages, this.pdfReady);
        });
    }

    renderPdfIntoPages(pdfFile:any, pages:number, callback?:Function){
        for(let i=0;i<this.pages.length;i++){
            pdfFile.getPage(this.pages[i]).then((page:any)=>{
                this.pdfPages[i] = page;
                if(i===this.pages.length-1 && callback && typeof callback==='function'){
                    callback.call(this, this.pdfPages);
                }
            });
        }
    }

    loadPageAsCanvas(obj:any, newScale?:number){
        for(let i=0;i<obj.length;i++){
            let page:any = obj[i];
            let viewport:any, context:any, renderContext:any, scale:number, canvasWidth:number, canvasHeight:number;
            let canvas:any = document.getElementById('canvas-'+this.pages[i]);
            let widthOfPDF:number = page.getViewport(1.0).width;
            let heightOfPDF:number = page.getViewport(1.0).height;

            if(newScale && typeof newScale==='number'){
                scale = newScale;
                canvas.width = canvasWidth = widthOfPDF * newScale;
                canvas.height = canvasHeight = heightOfPDF * newScale;
            }else{
                canvasWidth = this.initialCanvasWrapperWidth;
                scale = Number((canvasWidth / widthOfPDF).toFixed(1));
                canvasHeight = Math.ceil(scale * heightOfPDF);
                this.initialCanvasWrapperHeight = canvasHeight;
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                this.initialScaleValue = scale;
            }
            
            viewport = page.getViewport(scale);
            context = canvas.getContext('2d');
            renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
            
            if(i===obj.length-1){
                this.currentViewerContainerWidth = canvasWidth;
                this.currentViewerContainerHeight = canvasHeight;
                this.currentCanvasWrapperWidth = canvasWidth;
                this.currentCanvasWrapperHeight = canvasHeight;
                this.currentViewerWidth = canvasWidth;
                this.currentViewerHeight = canvasHeight * this.totalPageNumber;
                this.currentScaleValue = scale;
            }
        }
    }

    pdfReady(obj:any){
        /**code goes hear after PDF ready */
        this.loadPageAsCanvas(obj);
        var obj:any = this.grabData();
        this.emitFromPdfPanel.emit({event:'pdfReady', data:obj});
        jQuery('.loading-div').fadeOut(300);
    }

    grabData(){
        var viewerContainerWidth:number = jQuery('#pdf-panel-viewerContainer').width;
        var viewerContainerHeight:number = jQuery('#pdf-panel-viewerContainer').height;
        var initialPageOffsetTop:number = jQuery('.canvas-wrapper:first-child').offset().top;
        var initialPageOffsetLeft:number = jQuery('.canvas-wrapper:first-child').offset().left;
        var scrollTop:number = jQuery('#pdf-panel-area').scrollTop();
        var scrollLeft:number = jQuery('#pdf-panel-area').scrollLeft();
        var offsetTop:number = jQuery('#pdf-panel-viewerContainer').offset().top;
        var offsetLeft:number = jQuery('#pdf-panel-viewerContainer').offset().left;
        var initialPageNumber:number = (jQuery('#nav-holder .goto-page') && jQuery('#nav-holder .goto-page').val() && parseInt(jQuery('#nav-holder .goto-page').val())>0)?parseInt(jQuery('#nav-holder .goto-page').val()):1;
        var returnObj:any = {
                                viewerContainerWidth:this.currentViewerContainerWidth,
                                viewerContainerHeight:this.currentViewerContainerHeight,
                                viewerWidth:this.currentViewerWidth,
                                viewerHeight:this.currentViewerHeight,
                                initialPageWidth:this.currentViewerContainerWidth,
                                initialPageHeight:this.currentViewerContainerHeight,
                                initialPageOffsetTop:initialPageOffsetTop,
                                initialPageOffsetLeft:initialPageOffsetLeft,
                                scrollTop:scrollTop,
                                scrollLeft:scrollLeft,
                                offsetTop:offsetTop,
                                offsetLeft:offsetLeft,
                                initialPageNumber:initialPageNumber,
                                totalPageNumber:this.totalPageNumber,
                                currentScaleValue:this.currentScaleValue,
                                viewerTopPosition:this.viewerTopPosition,
                                initialScaleValue:this.initialScaleValue,
                                initialAngle:this.initialAngle,
                                rotatePlus90Degree:this.rotatePlus90Degree,
                                rotateMinus90Degree:this.rotateMinus90Degree,
                                transformOrigin:this.transformOrigin,
                                positionStyle:this.positionStyle,
                                leftStyle:this.leftStyle
                            }
        return returnObj;
    }

    loadPagePrev(obj:any){
        (obj && obj.pageNumber && typeof obj.pageNumber==='number')?this.loadPageByPageNo(obj):'';
    }

    loadPageNext(obj:any){
        (obj && obj.pageNumber && typeof obj.pageNumber==='number')?this.loadPageByPageNo(obj):'';
    }

    loadPageByPageNo(obj:any){
        if(obj && obj.pageNumber && typeof obj.pageNumber==='number'){
            this.currentPageNumber = obj.pageNumber;
            this.viewerTopPosition = this.currentCanvasWrapperHeight * (obj.pageNumber - 1) * -1;
            var obj:any = this.grabData();
            this.emitFromPdfPanel.emit({event:'pdfUpdate', data:obj});
        }
    }

    movePageToggle(){
        //console.log('movePageToggle');
    }

    turnPageHorizontalVertical(obj:any){
        if(obj && obj.angle && typeof obj.angle==='number' && obj.angle===90){
            var widthForManipulation:number = this.currentViewerContainerWidth;
            var heightForManipulation:number = this.currentViewerContainerHeight;
            var persentageForYPos:number = 50;//This is hardcodevalue;
            var ratio:number = 0;
            var ratioX:string = '';
            var ratioY:string = '';
            if(this.rotateDeg===-90){
                this.rotateMinus90Degree = true;
                ratio = widthForManipulation / (heightForManipulation / persentageForYPos);
                ratioX = String(persentageForYPos);
                ratioY = String(ratio);
            }else{
                this.rotatePlus90Degree = true;
                ratio = heightForManipulation / (widthForManipulation / persentageForYPos);
                ratioX = String(ratio);
                ratioY = String(persentageForYPos);
            }
            console.log(this.rotateDeg, 'ratioX =',ratioX,'ratioY =',ratioY);
            this.transformOrigin = this.domSanitizerService.bypassSecurityTrustStyle(ratioX+'% '+ratioY+'%');
            this.positionStyle = 'absolute';
            this.onPdfPanelResize();
            setTimeout(()=>{
                jQuery('#pdf-workmat-area').scrollTop(0);
            },10);
        }else{
            this.positionStyle = 'relative';
            this.leftStyle = 0;
            this.rotatePlus90Degree = this.rotateMinus90Degree = false;
            var obj:any = this.grabData();
            this.emitFromPdfPanel.emit({event:'pdfUpdate', data:obj});
        }
    }

    zoomInPage(obj:any){
        if(obj && obj.zoomValue && typeof obj.zoomValue==='number'){
            this.loadPageAsCanvas(this.pdfPages, obj.zoomValue);
            this.loadPageByPageNo({pageNumber:this.currentPageNumber});
            this.onPdfPanelResize();
        }
    }

    zoomOutPage(obj:any){
        if(obj && obj.zoomValue && typeof obj.zoomValue==='number'){
            this.loadPageAsCanvas(this.pdfPages, obj.zoomValue);
            this.loadPageByPageNo({pageNumber:this.currentPageNumber});
            this.onPdfPanelResize();
        }
    }

    onPdfPanelResize(obj?:any){
        if(this.positionStyle==='absolute'){
            var width:number = (obj && obj.target && obj.target.innerWidth)?obj.target.innerWidth:(jQuery('#pdf-panel-area').innerWidth()>0)?jQuery('#pdf-panel-area').innerWidth():0;
            console.log(this.currentViewerContainerHeight, width);
            if(width > this.currentViewerContainerHeight){
                this.leftStyle = (width - this.currentViewerContainerHeight)/2;
            }else{
                this.leftStyle = 0;
            }
            var obj:any = this.grabData();
            this.emitFromPdfPanel.emit({event:'pdfUpdate', data:obj});
        }else{
            this.leftStyle = 0;
        }
    }
}