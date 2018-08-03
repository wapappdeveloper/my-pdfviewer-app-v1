import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { MXGameCommon } from '../../../shared/libs/mxgame.common';

declare var jQuery: any;
declare var Hammer: any;

@Component({
    selector: 'pdf-controls',
    templateUrl: './pdf.controls.component.html',
})
export class PDFControls  {

    @Output() emitFromPdfControl = new EventEmitter();

    @Input() private parentInstance:any;

    zoomLimit:number = 4;
    delayBetweenZoom:number = 1.2;//in seconds
    zoomFired:boolean = false;

    initialPageNumber:number = 1;
    totalPageNumber:number = 0;
    currentPageNumber:number = 0;
    initialScaleValue:number = 1;
    currentScaleValue:number = 1;
    initialAngle:number = 0;
    currentAngle:number;
    
    allowOnce:boolean = true;
    scaleCount:number = 0;
    pinchScale = 0;
    currentPinch = "";

    disablezoomIn:boolean = false;
    disablezoomOut:boolean = false;
    disableMove:boolean = true;
    disableturnHorVert:boolean = false;
    disablePrev:boolean = false;
    disableNext:boolean = false;

    constructor(){}

    ngOnInit() { }

    initPdfControls(obj:any={initialPageNumber:1, totalPageNumber:0, scaleValue:1}){
        this.currentPageNumber = obj.initialPageNumber;
        this.totalPageNumber = obj.totalPageNumber;
        if(this.allowOnce){
            this.allowOnce = false;
            this.initialScaleValue = obj.currentScaleValue;
            this.initialAngle = obj.initialAngle;
        }
        this.currentScaleValue = this.initialScaleValue;
        this.currentAngle = this.initialAngle;
        //console.log(this.currentPageNumber, this.totalPageNumber, this.initialScaleValue);
        this.addPinchZoom();
    }
    loadPagePrev(event:any){
        event.preventDefault();
        if(this.currentPageNumber>1){
            this.currentPageNumber--;
            this.emitFromPdfControl.emit({event:'loadPagePrev', data:{pageNumber:this.currentPageNumber}});
        }
    }
    loadPageNext(event:any){
        event.preventDefault();
        if(this.currentPageNumber<this.totalPageNumber){
            this.currentPageNumber++;
            this.emitFromPdfControl.emit({event:'loadPageNext', data:{pageNumber:this.currentPageNumber}});
        }
    }
    loadPageByPageNo(event:any){
        event.preventDefault();
        var pageNumber:number = parseInt(event.target.value);
        if(pageNumber && pageNumber>=1 && pageNumber<=this.totalPageNumber && pageNumber!==this.currentPageNumber){
            this.currentPageNumber = pageNumber;
            this.emitFromPdfControl.emit({event:'loadPageByPageNo', data:{pageNumber:this.currentPageNumber}});
        }else{
            console.log('given value is more than limit, Total Pages is ='+this.totalPageNumber);
            jQuery('#nav-holder .goto-page').val(this.currentPageNumber);
        }
    }
    movePageToggle(event?:any){
        (event)?event.preventDefault():'';
        this.disableMove = !this.disableMove;
        if(!this.disableMove){
            this.emitFromPdfControl.emit({event:'enablePanning'});
        }else{
            this.emitFromPdfControl.emit({event:'disablePanning'});
        }
    }
    turnPageHorizontalVertical(event?:any){
        (event)?event.preventDefault():'';
        if(this.currentAngle===0){
            this.currentAngle = 90;
        }else{
            this.currentAngle = 0;
        }
        this.emitFromPdfControl.emit({event:'turnPageHorizontalVertical', data:{angle:this.currentAngle}});
    }
    zoomTimer(){
        var currentLimit:number = 0;
        var timer:any = setInterval(()=>(
            currentLimit+=0.1,
            (currentLimit>=this.delayBetweenZoom)?clearInterval(timer):'',
            this.zoomFired = false
        ),100);
    }
    zoomInPage(event?:any){
        if(!this.zoomFired){
            this.zoomFired = true;
            this.zoomTimer();
        }else{
            return {zoomIn:this.disablezoomIn, zoomOut:this.disablezoomOut};
        }
        (event)?event.preventDefault():'';
        if(this.scaleCount < this.zoomLimit){
            this.scaleCount++;
            this.currentScaleValue = this.currentScaleValue + (0.2);
            this.emitFromPdfControl.emit({event:'zoomInPage', data:{zoomValue:this.currentScaleValue}});
            (this.scaleCount===this.zoomLimit)?this.disablezoomIn = true:this.disablezoomIn = false;
            this.disablezoomOut = false;
        }else{
            //console.log('zoom maximum level limit is '+this.zoomLimit);
        }
        return {zoomIn:this.disablezoomIn, zoomOut:this.disablezoomOut};
    }
    zoomOutPage(event?:any){
        if(!this.zoomFired){
            this.zoomFired = true;
            this.zoomTimer();
        }else{
            return {zoomIn:this.disablezoomIn, zoomOut:this.disablezoomOut};
        }
        (event)?event.preventDefault():'';
        if(this.scaleCount > -(this.zoomLimit)){
            this.scaleCount--;
            this.currentScaleValue = this.currentScaleValue - (0.2);
            this.emitFromPdfControl.emit({event:'zoomOutPage', data:{zoomValue:this.currentScaleValue}});
            (this.scaleCount===-(this.zoomLimit))?this.disablezoomOut = true:this.disablezoomOut = false;
            this.disablezoomIn = false;
        }else{
            //console.log('zoom minimum level limit is -'+this.zoomLimit);
        }
        return {zoomIn:this.disablezoomIn, zoomOut:this.disablezoomOut};
    }
    undoAction(event?:any){
        this.parentInstance._undoAction();
    }
    redoAction(event?:any){
        this.parentInstance._redoAction();
    }
    clearAllAction(data?:any){
        this.emitFromPdfControl.emit({event:'clearAllAction', data:{data}});
    }
    addPinchZoom() {
        var stage = document.getElementById('stage');
        var stg = new Hammer.Manager(stage);
        var pinch = new Hammer.Pinch();

        stg.add([pinch]);
        stg.on("pinchend", (event) => {

            if (!this.parentInstance.pdfWorkmat.pinchZoom)
                return;
            if (this.currentPinch === "in") {
                this.zoomOutPage();
            }
            else if (this.currentPinch === "out") {
                this.zoomInPage();
            }
        });

        stg.on("pinchin", (event) => {
            this.currentPinch = "in";
        });
        stg.on("pinchout", (event) => {
            this.currentPinch = "out";
        });
    }
} 
