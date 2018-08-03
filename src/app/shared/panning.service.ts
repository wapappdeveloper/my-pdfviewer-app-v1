import { OnInit } from '@angular/core';

export class PanningService implements OnInit{
	mouseDownX:number = null;
	mouseDownY:number = null;
	mouseDown:boolean = null;
	mouseMoveX:number = null;
	mouseMoveY:number = null;
	mouseMove:boolean = null;
	mouseUpX:number = null;
	mouseUpY:number = null;
	mouseUp:boolean = null;
	mousePreviousX:number = null;
	mousePreviousY:number = null;
	mouseScrollTop:number = null;
	mouseScrollLeft:number = null;
	mouseDownSrollTop:number = null;
	mouseDownSrollLeft:number = null;
	scroll:boolean;
	containerId:string;
	constructor(){
		Object(window).PanningService = this;
	}
	ngOnInit(){
		
	}
	initPanning(id:string, scroll:boolean=false){
		if(id && document.getElementById(id)){
			this.containerId = id;
			var scrollPresent:any = (this.containerId)?this.detectScroll(this.containerId):false;
			this.scroll = scroll;
			(scroll)?((scrollPresent)?this.toParentChild(this.containerId):console.log('panning not applicable')):this.toParentChild(this.containerId);
		}else{
			console.error('passed id of element is not exist in document');
		}
	}
	detectScroll(id:string, option?:string):boolean{
		var elm:any = document.getElementById(id);
		if(option && option==='x'){
			return (elm) ? elm.scrollWidth > Number(window.getComputedStyle(elm).width) : false;
		}else if(option && option==='y'){
			return (elm) ? elm.scrollHeight > Number(window.getComputedStyle(elm).height) : false;
		}else{
			return (elm) ? elm.scrollWidth > Number(window.getComputedStyle(elm).width) : ((elm) ? elm.scrollHeight > Number(window.getComputedStyle(elm).height) : false);
		}
	}
	private mouseDownHandler(event:any){
		var thiS:any = Object(window).PanningService;
		thiS.mouseDownX = Number(event.pageX);
		thiS.mouseDownY = Number(event.pageY);
		thiS.mouseDownSrollTop = document.getElementById(thiS.containerId).scrollTop;
		thiS.mouseDownSrollLeft = document.getElementById(thiS.containerId).scrollLeft;
		thiS.mouseDown = true;
		document.getElementById(thiS.containerId).addEventListener('mousemove',thiS.mouseMoveHandler);
	}
	private mouseMoveHandler(event:any){
		var thiS:any = Object(window).PanningService;
		var heightOfHolderElem:number = parseInt(Object(window).getComputedStyle(document.getElementById(thiS.containerId)).height);
		var widthOfHolderElem:number = parseInt(window.getComputedStyle(document.getElementById(thiS.containerId)).width);
		var verticalMoveRatio:number = 1;
		var horizontalMoveRatio:number = 1;

		event.preventDefault();
		thiS.mouseMoveX = Number(event.pageX);
		thiS.mouseMoveY = Number(event.pageY);
		thiS.mouseMove = true;
		if(thiS.mouseDown && ((thiS.mouseDownX && thiS.mouseMoveX && thiS.mouseDownX != thiS.mouseMoveX && thiS.mouseMoveX != thiS.mousePreviousX) || (thiS.mouseDownY && thiS.mouseMoveY && thiS.mouseDownY != thiS.mouseMoveY && thiS.mouseMoveY != thiS.mousePreviousY))){
			document.body.style.cursor = 'move';
		}
		if(thiS.mouseDown && (thiS.mouseDownX && thiS.mouseMoveX && thiS.mouseDownX != thiS.mouseMoveX && thiS.mouseMoveX != thiS.mousePreviousX) && (thiS.mouseDownY && thiS.mouseMoveY && thiS.mouseDownY != thiS.mouseMoveY && thiS.mouseMoveY != thiS.mousePreviousY)){
			thiS.mousePreviousX = thiS.mouseMoveX;
			thiS.mousePreviousY = thiS.mouseMoveY;
			thiS.mouseScrollTop = thiS.mouseDownSrollTop + (verticalMoveRatio * (thiS.mouseDownY - thiS.mouseMoveY));
			thiS.mouseScrollLeft = thiS.mouseDownSrollLeft + (horizontalMoveRatio * (thiS.mouseDownX - thiS.mouseMoveX));
			document.getElementById(thiS.containerId).scrollTop = thiS.mouseScrollTop;
			document.getElementById(thiS.containerId).scrollLeft = thiS.mouseScrollLeft;
		}else if(thiS.mouseDown && thiS.mouseDownY && thiS.mouseMoveY && thiS.mouseDownY != thiS.mouseMoveY && thiS.mouseMoveY != thiS.mousePreviousY){
			thiS.mousePreviousY = thiS.mouseMoveY;
			thiS.mouseScrollTop = thiS.mouseDownSrollTop + (verticalMoveRatio * (thiS.mouseDownY - thiS.mouseMoveY));
			document.getElementById(thiS.containerId).scrollTop = thiS.mouseScrollTop;
		}else if(thiS.mouseDown && thiS.mouseDownX && thiS.mouseMoveX && thiS.mouseDownX != thiS.mouseDownY && thiS.mouseMoveX != thiS.mousePreviousX){
			thiS.mousePreviousX = thiS.mouseMoveX;
			thiS.mouseScrollLeft = thiS.mouseDownSrollLeft + (horizontalMoveRatio * (thiS.mouseDownX - thiS.mouseMoveX));
			document.getElementById(thiS.containerId).scrollLeft = thiS.mouseScrollLeft;
		}else{
			thiS.mouseMove = false;
		}
	}
	private mouseUpHandler(event:any){
		var thiS:any = Object(window).PanningService;
		thiS.mouseDown = false;
		thiS.mouseMove = false;
		document.getElementById(thiS.containerId).removeEventListener('mousemove',thiS.mouseMoveHandler);
		document.body.style.cursor = 'auto';
	}
	toParentChild(containerId:string){
		this.containerId = containerId;
		document.getElementById(containerId).addEventListener('mousedown',this.mouseDownHandler);
		document.addEventListener('mouseup',this.mouseUpHandler);
	}
	clear(containerId:string){
		document.getElementById(containerId).removeEventListener('mousedown',this.mouseDownHandler);
        document.removeEventListener('mouseup', this.mouseUpHandler);
	}
}