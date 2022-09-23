import { Category, mercatorProjection, Projection, writeGeoJSON } from '@vcmap/core';
import { ToolboxType } from '@vcmap/ui';
import { version, name } from '../package.json';
import TreeEditorBalloon from './treeEditorBalloon.js';
import { categoryName, downloadGeoJSON, layerName, placeTree } from './api.js';
import TreePlanterInteraction from './treePlanterInteraction.js';

export default function treePlanterPlugin() {
  return {
    get name() { return name; },
    get version() { return version; },
    /**
     * @param {import("@vcmap/ui").VcsUiApp} vcsUiApp
     * @returns {void}
     */
    async initialize(vcsUiApp) {
      vcsUiApp.featureInfo.collection.add(new TreeEditorBalloon());
      const treesCategory = await vcsUiApp.categories.requestCategory({
        type: Category.className,
        name: categoryName,
        layerOptions: {
          name: layerName,
          projection: mercatorProjection.toJSON(),
          properties: {
            featureInfo: 'treeEditor',
          },
        },
        featureProperty: 'tree',
      });

      vcsUiApp.categoryManager.addCategory(
        categoryName,
        name,
        [
          {
            name: 'Download',
            icon: 'mdi-download',
            title: 'treePlanterPlugin.geojsonDownloadTitle',
            callback() {
              const geoJSON = writeGeoJSON({ features: treesCategory.layer.getFeatures() }, { prettyPrint: true });
              downloadGeoJSON(geoJSON);
            },
          },
          {
            name: 'Hide',
            icon: 'mdi-eye',
            title: 'treePlanterPlugin.hideTreeLayer',
            callback() {
              if (treesCategory.layer.active || treesCategory.layer.loading) {
                treesCategory.layer.deactivate();
                this.icon = 'mdi-eye-off';
                this.title = 'treePlanterPlugin.showTreeLayer';
              } else {
                treesCategory.layer.activate();
                this.icon = 'mdi-eye';
                this.title = 'treePlanterPlugin.hideTreeLayer';
              }
            },
          },
        ],
      );

      vcsUiApp.categoryManager.addMappingFunction(
        () => true,
        (item, category, treeViewItem) => {
          item.actions = item.actions ?? [];
          treeViewItem.actions.push(
            {
              name: 'treePlanterPlugin.zoomTo',
              title: 'treePlanterPlugin.zoomTo',
              icon: 'mdi-crosshairs',
              async callback() {
                const vp = await vcsUiApp.maps.activeMap?.getViewpoint();
                if (vp) {
                  vp.groundPosition = Projection.mercatorToWgs84(item.tree.getGeometry().getCoordinates());
                  delete vp.cameraPosition;
                  vp.distance = 400;
                  vp.animate = true;
                  await vcsUiApp.maps.activeMap.gotoViewpoint(vp);
                }
              },
            },
            {
              name: 'treePlanterPlugin.delete',
              title: 'treePlanterPlugin.delete',
              icon: 'mdi-delete',
              callback() { category.collection.remove(item); },
            },
          );
          return item;
        },
        [categoryName],
        name,
      );

      const { layer } = treesCategory;
      vcsUiApp.layers.add(layer);
      await layer.activate();

      vcsUiApp.contextMenuManager.addEventHandler((event) => {
        if (!event.feature) {
          return [{
            name: 'treePlanterPlugin.contextMenuTitle',
            title: 'treePlanterPlugin.contextMenuTitle',
            icon: 'mdi-pine-tree',
            callback() {
              return placeTree(event, vcsUiApp);
            },
          }];
        }
        return [];
      }, name);
      vcsUiApp.toolboxManager.add({
        type: ToolboxType.SINGLE,
        action: {
          active: false,
          _remove() {},
          icon: 'mdi-pine-tree',
          name: 'Plant Tree',
          title: 'treePlanterPlugin.toolboxTitle',
          callback() {
            this._remove();
            this.active = !this.active;
            if (this.active) {
              this._remove = vcsUiApp.maps.eventHandler.addExclusiveInteraction(
                new TreePlanterInteraction(vcsUiApp),
                () => {
                  this.active = false;
                  this._remove = () => {};
                },
              );
            } else {
              this._remove = () => {};
            }
          },
          destroy() {
            this._remove();
          },
        },
      }, name);

      this.destroy = () => {
        vcsUiApp.layers.remove(layer);
      };
    },
    i18n: {
      en: {
        Trees: 'Trees',
        treePlanterPlugin: {
          geojsonDownloadTitle: 'Download the trees layer as a GeoJSON',
          contextMenuTitle: 'Plant Tree',
          toolboxTitle: 'Plant Tree',
          hideTreeLayer: 'Hide the tree layer',
          showTreeLayer: 'Show the tree layer',
          zoomTo: 'ZoomTo tree',
          delete: 'Delete tree',
          balloonTitle: 'This is a tree planted by the TreePlanter plugin. You can adjust its height or remove it.',
          balloonHeader: 'Tree Editor',
          height: 'Height',
        },
      },
      de: {
        Trees: 'Bäume',
        treePlanterPlugin: {
          geojsonDownloadTitle: 'Geojson download',
          contextMenuTitle: 'Baum pflanzen',
          toolboxTitle: 'Baum Pflanzen',
          hideTreeLayer: 'Baum Ebene deaktivieren',
          showTreeLayer: 'Baum Ebene aktivieren',
          zoomTo: 'Zum Baum springen',
          delete: 'Baum löschen',
          balloonTitle: 'Baum wurde vom Baum Editor Plugin erstellt. Du kannst die Höhe anpassen und den Baum löschen.',
          balloonHeader: 'Baum Editor',
          height: 'Höhe',
        },
      },
    },
  };
}
