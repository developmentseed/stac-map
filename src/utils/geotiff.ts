import { SourceCache, SourceChunk } from "@chunkd/middleware";
import { SourceView } from "@chunkd/source";
import { SourceHttp } from "@chunkd/source-http";
import { GeoTIFF } from "@developmentseed/geotiff";

/**
 * Load a `GeoTIFF` from a URL, priming the underlying HTTP source's metadata
 * via a HEAD request before wrapping it in the chunked view.
 *
 * Mirrors `GeoTIFF.fromUrl`, but the upfront HEAD works around a
 * `@chunkd/source-http` regression where `Content-Range` parsing on
 * range-fetched responses can leave `metadata.size` unset, breaking COG reads
 * (see https://github.com/blacha/chunkd/pull/1666 and
 * https://github.com/developmentseed/stac-map/issues/459). `SourceHttp.fetch`
 * will not overwrite `metadata` once populated, so the HEAD result wins.
 */
export async function loadGeoTIFF(
  href: string,
  options: { chunkSize?: number; cacheSize?: number } = {}
): Promise<GeoTIFF> {
  const { chunkSize = 32 * 1024, cacheSize = 1024 * 1024 } = options;
  const source = new SourceHttp(href, {});
  await source.head();
  const chunk = new SourceChunk({ size: chunkSize });
  const cache = new SourceCache({ size: cacheSize });
  const view = new SourceView(source, [chunk, cache]);
  return await GeoTIFF.open({
    dataSource: source,
    headerSource: view,
  });
}
