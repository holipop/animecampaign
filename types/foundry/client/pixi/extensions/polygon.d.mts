export {};

declare module "pixi.js" {
  namespace Polygon {
    interface ClipperPoint {
      X: number;
      Y: number;
    }
  }

  interface Polygon {
    /**
     * Test whether the polygon is has a positive signed area.
     * Using a y-down axis orientation, this means that the polygon is "clockwise".
     */
    get isPositive(): boolean;

    /**
     * @remarks Non enumerable
     */
    _isPositive?: boolean;

    /**
     * Clear the cached signed orientation.
     */
    clearCache(): void;

    /**
     * Compute the signed area of polygon using an approach similar to ClipperLib.Clipper.Area.
     * The math behind this is based on the Shoelace formula. https://en.wikipedia.org/wiki/Shoelace_formula.
     * The area is positive if the orientation of the polygon is positive.
     * @returns The signed area of the polygon
     */
    signedArea(): number;

    /**
     * Reverse the order of the polygon points in-place, replacing the points array into the polygon.
     * Note: references to the old points array will not be affected.
     * @returns This polygon with its orientation reversed
     */
    reverseOrientation(): PIXI.Polygon;

    /**
     * Add a de-duplicated point to the Polygon.
     * @param point - The point to add to the Polygon
     * @returns A reference to the polygon for method chaining
     */
    addPoint(point: Point): this;

    /**
     * Return the bounding box for a PIXI.Polygon.
     * The bounding rectangle is normalized such that the width and height are non-negative.
     * @returns The bounding PIXI.Rectangle
     */
    getBounds(): PIXI.Rectangle;

    /**
     * Construct a PIXI.Polygon instance from an array of clipper points [\{X,Y\}, ...].
     * @param points  - An array of points returned by clipper
     * @param options - Options which affect how canvas points are generated
     * @param scalingFactor -
     * @returns The resulting PIXI.Polygon
     */
    fromClipperPoints(
      points: PIXI.Polygon.ClipperPoint[],
      options?: {
        /**
         * A scaling factor used to preserve floating point precision
         * (default: `1`)
         */
        scalingFactor: number;
      },
    ): PIXI.Polygon;

    /**
     * Convert a PIXI.Polygon into an array of clipper points [\{X,Y\}, ...].
     * Note that clipper points must be rounded to integers.
     * In order to preserve some amount of floating point precision, an optional scaling factor may be provided.
     * @param options - Options which affect how clipper points are generated
     * @returns An array of points to be used by clipper
     */
    toClipperPoints(options?: {
      /** A scaling factor used to preserve floating point precision
       *  (default: `1`) */
      scalingFactor: number;
    }): PIXI.Polygon.ClipperPoint[];

    /**
     * Determine whether the PIXI.Polygon is closed, defined by having the same starting and ending point.
     */
    get isClosed(): boolean;

    /**
     * Intersect this PIXI.Polygon with another PIXI.Polygon using the clipper library.
     * @param other   - Another PIXI.Polygon
     * @param options - Options which configure how the intersection is computed
     * @returns The intersected polygon or null if no solution was present
     */
    intersectPolygon(
      other: PIXI.Polygon,
      options: {
        /** The clipper clip type */
        clipType?: number;

        /** A scaling factor passed to Polygon#toClipperPoints to preserve precision */
        scalingFactor?: number;
      },
    ): PIXI.Polygon | null;

    /**
     * Intersect this PIXI.Polygon with an array of ClipperPoints.
     * @param clipperPoints - Array of clipper points generated by PIXI.Polygon.toClipperPoints()
     * @param options       - Options which configure how the intersection is computed
     */
    intersectClipper(
      clipperPoints: PIXI.Polygon.ClipperPoint[],
      options?: {
        /** The clipper clip type */
        clipType?: number;

        /** A scaling factor passed to Polygon#toClipperPoints to preserve precision */
        scalingFactor?: number;
      },
    ): PIXI.Polygon.ClipperPoint[];

    /**
     * Intersect this PIXI.Polygon with a PIXI.Circle.
     * For now, convert the circle to a Polygon approximation and use intersectPolygon.
     * In the future we may replace this with more specialized logic which uses the line-circle intersection formula.
     * @param circle  - A PIXI.Circle
     * @param options - Options which configure how the intersection is computed
     * @returns The intersected polygon
     */
    intersectCircle(
      circle: PIXI.Circle,
      options?: {
        /** The number of points which defines the density of approximation */
        density: number;
      },
    ): PIXI.Polygon;

    /**
     * Intersect this PIXI.Polygon with a PIXI.Rectangle.
     * For now, convert the rectangle to a Polygon and use intersectPolygon.
     * In the future we may replace this with more specialized logic which uses the line-line intersection formula.
     * @param rect    - A PIXI.Rectangle
     * @param options - Options which configure how the intersection is computed
     * @returns The intersected polygon
     */
    intersectRectangle(rect: PIXI.Rectangle, options?: Record<string, unknown>): PIXI.Polygon;
  }
}
