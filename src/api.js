import { Feature } from 'ol';
import { Point } from 'ol/geom.js';
import { getPluginAssetUrl } from '@vcmap/ui';
import { v4 } from 'uuid';
import { name } from '../package.json';

export const layerName = 'treePlanterLayer';

export const categoryName = 'Trees';

/**
 * @param {import("@vcmap/core").InteractionEvent} event
 * @param {import("@vcmap/ui").VcsUiApp} vcsUiApp
 * @param {boolean} [select=true] - select the feature after creation
 */
export async function placeTree(event, vcsUiApp, select = true) {
  const category = vcsUiApp.categories.getByKey(categoryName);
  if (category) {
    const tree = new Feature({
      geometry: new Point(event.position),
      olcs_modelUrl: getPluginAssetUrl(
        vcsUiApp,
        name,
        'plugin-assets/tree.glb',
      ),
      olcs_modelScaleX: 10 / 37,
      olcs_modelScaleY: 10 / 37,
      olcs_modelScaleZ: 10 / 37,
    });
    category.collection.add({
      name: v4(),
      tree,
    });
    if (!category.layer.active) {
      await category.layer.activate();
    }
    if (select) {
      setTimeout(async () => {
        await vcsUiApp.featureInfo.selectFeature(tree, event.position, [
          event.windowPosition.x,
          event.windowPosition.y,
        ]);
      }, 0);
    }
  }
}

/**
 * @param {string} objectString
 */
export function downloadGeoJSON(objectString) {
  const uri = `data:application/json;charset=utf-8,${encodeURIComponent(objectString)}`;
  const link = document.createElement('a');
  const now = new Date();
  link.download = `Trees - ${now.toISOString().replace(/:/g, '-')}.json`;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
