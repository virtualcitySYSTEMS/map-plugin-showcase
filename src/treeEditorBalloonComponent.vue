<template>
  <div>
    <BalloonComponent :feature-id="featureId" v-bind="{...$attrs}">
      <v-card class="px-2 pb-4">
        {{ $t('treePlanterPlugin.balloonTitle')}}
        <div class="mt-12">
          <v-slider
            v-model="height"
            min="0"
            max="100"
            :label="$t('treePlanterPlugin.height')"
            thumb-label="always"
          />
        </div>
        <VcsButton icon="mdi-delete" @click="removeTree">
          {{ $t('treePlanterPlugin.delete')}}
        </VcsButton>
      </v-card>
    </BalloonComponent>
  </div>
</template>

<script>
  import { computed, inject, ref } from 'vue';
  import { BalloonComponent, VcsButton } from '@vcmap/ui';
  import { layerName } from './api.js';

  export default {
    name: 'treeEditorBalloonComponent',
    components: { BalloonComponent, VcsButton },
    props: {
      featureId: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const height = ref(1);
      const vcsApp = inject('vcsApp');
      const layer = vcsApp.layers.getByKey(layerName);
      const feature = layer.getFeatureById(props.featureId);

      height.value = feature.get('olcs_modelScaleX') != null ? feature.get('olcs_modelScaleX') * 37 : 1;
      return {
        removeTree() {
          layer.removeFeaturesById([feature.getId()]);
          vcsApp.featureInfo.clear();
        },
        height: computed({
          get() { return height.value; },
          set(value) {
            if (value > 0) {
              height.value = value;
              feature.set('olcs_modelScaleX', value / 37);
              feature.set('olcs_modelScaleY', value / 37);
              feature.set('olcs_modelScaleZ', value / 37);
            }
          },
        }),
      };
    },
  };
</script>

<style scoped>

</style>
