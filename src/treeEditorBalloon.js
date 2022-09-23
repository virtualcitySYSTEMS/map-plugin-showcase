import { BalloonFeatureInfoView } from '@vcmap/ui';
import TreeEditorBalloonComponent from './treeEditorBalloonComponent.vue';

class TreeEditorBalloon extends BalloonFeatureInfoView {
  constructor() {
    super({ name: 'treeEditor', title: 'treePlanterPlugin.balloonHeader' }, TreeEditorBalloonComponent);
  }
}

export default TreeEditorBalloon;
