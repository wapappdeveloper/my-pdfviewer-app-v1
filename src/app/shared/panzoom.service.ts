declare var svg4everybody: any;
declare var svgPanZoom: any;
declare var jQuery:any;

export class PanZoomService{
    protected zoomScale = 0.1;
    protected zoomMinScale = 0;
    protected zoomMaxScale = 3;
    protected zoomPanInstance: any

    constructor(){};

    initPanZoom(id:string, callback:Function) {
        var zoomPanId:string;
        var allowOnce:boolean = true;
        (id && id.indexOf('#')!==-1)?zoomPanId = id:zoomPanId = '#'+id;
        var onlyId:string = id.replace('#','');
        var thiS:any = this;
        this.zoomPanInstance = svgPanZoom(zoomPanId, {
            zoomEnabled: true,
            panEnabled: false,
            mouseWheelZoomEnabled: false,
            controlIconsEnabled: false,
            zoomScaleSensitivity: this.zoomScale,
            minZoom: this.zoomMinScale,
            maxZoom: this.zoomMaxScale,
            fit: false,
            contain: false,
            center: false,
            beforeZoom: (oldScale: any, newScale: any) => {
                if (newScale > oldScale) {
                } else {
                }
            },
            onZoom: () => { },
            beforePan: () => { },
            onPan: () => { },
            onUpdatedCTM: () =>{
                if(allowOnce){
                    allowOnce = false;
                    thiS.panZoomReady(onlyId);
                    callback.call(this);
                }
            }
        });
    }
    private panZoomReady(id:string){
        jQuery('#stage').removeAttr('data-dt').removeAttr('data-ur');
        jQuery('#stage > g').attr('data-dt','stage').attr('data-ur','stage');
        jQuery('#stage > g').html('<rect x="0" y="0" width="30" height="30" stroke="black" fill="white" stroke-width="1"/>');
    }
    setZoom(value:number){
        this.zoomPanInstance.zoomAtPoint(value,{x:0,y:0});
    }
}