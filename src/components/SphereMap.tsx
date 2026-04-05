import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { MapProvider } from "../context/MapContext";
import { useSphereContext } from "../context/SphereContext";
import type {
  Bound,
  FilterType,
  FlyToOptions,
  Location,
  MapOptions,
  Range,
  SphereMap as SphereMapInstance,
} from "../types";

export interface SphereMapRef {
  getMap(): SphereMapInstance | null;
  goTo(target: FlyToOptions, animate?: boolean): void;
  repaint(): void;
  resize(): void;
  setBound(bound: Bound, options?: object): void;
  setCenter(location: Location, animate?: boolean): void;
  setFilter(filter: FilterType): void;
  setPitch(angle: number): void;
  setRotate(angle: number, animate?: boolean): void;
  setZoom(zoom: number, animate?: boolean): void;
}

export interface SphereMapProps {
  center?: Location;
  children?: ReactNode;
  className?: string;
  filter?: FilterType;
  id?: string;
  input?: boolean;
  language?: "th" | "en";
  lastView?: boolean;
  onClick?: (location: Location) => void;
  onDoubleClick?: (location: Location) => void;
  onDrag?: () => void;
  onDrop?: () => void;
  onError?: (error: Error) => void;
  onIdle?: () => void;
  onLocation?: (location: Location) => void;
  onMouseMove?: (location: Location) => void;
  onPitch?: (angle: number) => void;
  onReady?: (map: SphereMapInstance) => void;
  onRotate?: (angle: number) => void;
  onZoom?: (zoom: number) => void;
  pitch?: number;
  ref?: Ref<SphereMapRef>;
  rotate?: number;
  style?: CSSProperties;
  ui?: "Full" | "Mobile" | "None";
  zoom?: number;
  zoomRange?: Range;
}

export function SphereMap({
  children,
  ref,
  zoom = 7,
  zoomRange,
  center,
  language = "th",
  input = true,
  lastView = false,
  ui,
  filter,
  rotate,
  pitch,
  className,
  style,
  id,
  onReady,
  onZoom,
  onLocation,
  onClick,
  onDoubleClick,
  onRotate,
  onPitch,
  onDrag,
  onDrop,
  onIdle,
  onMouseMove,
  onError,
}: SphereMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SphereMapInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { sphere, isLoaded, registerMap, unregisterMap } = useSphereContext();

  const callbacksRef = useRef({
    onReady,
    onZoom,
    onLocation,
    onClick,
    onDoubleClick,
    onRotate,
    onPitch,
    onDrag,
    onDrop,
    onIdle,
    onMouseMove,
    onError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onReady,
      onZoom,
      onLocation,
      onClick,
      onDoubleClick,
      onRotate,
      onPitch,
      onDrag,
      onDrop,
      onIdle,
      onMouseMove,
      onError,
    };
  });

  const initialPropsRef = useRef({
    zoom,
    zoomRange,
    center,
    language,
    input,
    lastView,
    ui,
    filter,
    rotate,
    pitch,
  });

  useEffect(() => {
    if (!(isLoaded && sphere && containerRef.current)) {
      return;
    }

    const initialProps = initialPropsRef.current;

    try {
      const options: MapOptions = {
        placeholder: containerRef.current,
        zoom: initialProps.zoom,
        language: initialProps.language,
        input: initialProps.input,
        lastView: initialProps.lastView,
      };

      if (initialProps.zoomRange) {
        options.zoomRange = initialProps.zoomRange;
      }

      if (initialProps.center) {
        options.location = initialProps.center;
      }

      if (initialProps.ui) {
        options.ui = initialProps.ui;
      }

      const map = new sphere.Map(options);
      mapRef.current = map;

      map.Event.bind("ready", () => {
        setIsReady(true);
        registerMap(map);

        if (initialProps.filter && window.sphere) {
          map.enableFilter(window.sphere.Filter[initialProps.filter]);
        }

        if (typeof initialProps.rotate === "number") {
          map.rotate(initialProps.rotate, false);
        }

        if (typeof initialProps.pitch === "number") {
          map.pitch(initialProps.pitch);
        }

        callbacksRef.current.onReady?.(map);
      });

      map.Event.bind("zoom", () => {
        const currentZoom = map.zoom() as number;
        callbacksRef.current.onZoom?.(currentZoom);
      });

      map.Event.bind("location", () => {
        const currentLocation = map.location() as Location;
        callbacksRef.current.onLocation?.(currentLocation);
      });

      map.Event.bind("click", (location: Location) => {
        callbacksRef.current.onClick?.(location);
      });

      map.Event.bind("doubleClick", (location: Location) => {
        callbacksRef.current.onDoubleClick?.(location);
      });

      map.Event.bind("rotate", () => {
        const angle = map.rotate() as number;
        callbacksRef.current.onRotate?.(angle);
      });

      map.Event.bind("pitch", () => {
        const angle = map.pitch() as number;
        callbacksRef.current.onPitch?.(angle);
      });

      map.Event.bind("drag", () => {
        callbacksRef.current.onDrag?.();
      });

      map.Event.bind("drop", () => {
        callbacksRef.current.onDrop?.();
      });

      map.Event.bind("idle", () => {
        callbacksRef.current.onIdle?.();
      });

      map.Event.bind("mousemove", (location: Location) => {
        callbacksRef.current.onMouseMove?.(location);
      });

      map.Event.bind("error", (error: Error) => {
        callbacksRef.current.onError?.(error);
      });
    } catch (error) {
      callbacksRef.current.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }

    return () => {
      unregisterMap();
      mapRef.current = null;
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, sphere, registerMap, unregisterMap]);

  useImperativeHandle(
    ref,
    () => ({
      getMap: () => mapRef.current,
      setZoom: (newZoom: number, animate = true) => {
        mapRef.current?.zoom(newZoom, animate);
      },
      setCenter: (location: Location, animate = true) => {
        mapRef.current?.location(location, animate);
      },
      setBound: (bound: Bound, options?: object) => {
        mapRef.current?.bound(bound, options);
      },
      goTo: (target: FlyToOptions, animate = true) => {
        mapRef.current?.goTo(target, animate);
      },
      setRotate: (angle: number, animate = true) => {
        mapRef.current?.rotate(angle, animate);
      },
      setPitch: (angle: number) => {
        mapRef.current?.pitch(angle);
      },
      setFilter: (newFilter: FilterType) => {
        if (mapRef.current && window.sphere) {
          mapRef.current.enableFilter(window.sphere.Filter[newFilter]);
        }
      },
      resize: () => {
        mapRef.current?.resize();
      },
      repaint: () => {
        mapRef.current?.repaint();
      },
    }),
    []
  );

  const containerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    ...style,
  };

  return (
    <div
      className={className}
      id={id}
      ref={containerRef}
      style={containerStyle}
    >
      <MapProvider isReady={isReady} map={mapRef.current}>
        {isReady && children}
      </MapProvider>
    </div>
  );
}
