import {
  AbstractInteraction,
  EventType,
  ModificationKeyType,
  vcsLayerName,
} from '@vcmap/core';
import { categoryName, layerName, placeTree } from './api.js';

/**
 * @class
 * @extends {AbstractInteraction}
 */
class TreePlanterInteraction extends AbstractInteraction {
  /**
   * @param {import("@vcmap/ui").VcsUiApp} vcsUiApp
   */
  constructor(vcsUiApp) {
    super(
      EventType.CLICK,
      ModificationKeyType.NONE | ModificationKeyType.SHIFT,
    );
    /**
     * @type {import("@vcmap/core").VectorLayer}
     * @private
     */
    this._layer = vcsUiApp.layers.getByKey(layerName);
    /**
     * @type {import("@vcmap/ui").VcsUiApp}
     * @private
     */
    this._app = vcsUiApp;
    this.setActive();
  }

  async pipe(event) {
    if (event.key & ModificationKeyType.SHIFT) {
      if (event.feature && event.feature[vcsLayerName] === this._layer.name) {
        const { collection } = this._app.categories.getByKey(categoryName);
        const item = collection.getByKey(event.feature.getId());
        collection.remove(item);
      }
    } else if (!event.feature) {
      await placeTree(event, this._app, false);
    }
    return event;
  }
}

export default TreePlanterInteraction;
