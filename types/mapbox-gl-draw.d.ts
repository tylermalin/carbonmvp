declare module '@mapbox/mapbox-gl-draw' {
  export interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    defaultMode?: string;
    styles?: any[];
    userProperties?: boolean;
    boxSelect?: boolean;
    clickBuffer?: number;
    touchBuffer?: number;
    touchEnabled?: boolean;
    keybindings?: boolean;
    touchPanDistance?: number;
  }

  export default class MapboxDraw {
    constructor(options?: DrawOptions);
    onAdd(map: any): HTMLElement;
    onRemove(map: any): void;
    getDefaultPosition(): string;
    getAll(): GeoJSON.FeatureCollection;
    get(featureId: string): GeoJSON.Feature | undefined;
    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
    delete(ids: string | string[]): this;
    deleteAll(): this;
    changeMode(mode: string, options?: any): this;
    getMode(): string;
    set(featureCollection: GeoJSON.FeatureCollection): string[];
    trash(): this;
    getSelectedIds(): string[];
    getSelected(): GeoJSON.FeatureCollection;
    getSelectedPoints(): GeoJSON.FeatureCollection;
    setFeatureProperty(featureId: string, property: string, value: any): this;
  }
}

