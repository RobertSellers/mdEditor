import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.Object.create({
      layers: Ember.A(),
      featureGroup: null
    });
  },
  actions: {
    handleResize() {
      Ember.$('.map-file-picker')
        .height(Ember.$(window)
          .height() - Ember.$('#md-navbars')
          .outerHeight() - 15);
    },
    uploadData() {
      Ember.$('.map-file-picker .file-picker__input')
        .click();
    },
    deleteAllFeatures() {
      let features = this.currentModel.get('layers');
      let group = this.currentModel.get('featureGroup');

      if(features.length) {
        features.forEach((item) => {
          features.popObject(item);
          group.removeLayer(item._layer);
        });

        if(group._map.drawControl) {
          group._map.drawControl.remove();
        }
        features.clear();
      }
    },
    setFeatureGroup(obj) {
      this.currentModel.set('featureGroup', obj);
    },
    zoomAll() {
      let layer = this.currentModel.get('featureGroup');
      let bnds = layer.getBounds();
      let map = layer._map;

      if(bnds.isValid()) {
        map.fitBounds(bnds, {
          maxZoom: 14
        });
        return;
      }

      map.fitWorld();
    },
    exportGeoJSON() {
      let fg = this.currentModel.get('featureGroup');

      let json = {
        'type': 'FeatureCollection',
        'features': []
      };

      if(fg) {
        let geoGroup = fg.getLayers();
        geoGroup.forEach((l) => {
          let layers = l.getLayers();

          layers.forEach((layer) => {
            let feature = layer.feature;

            json.features.push({
              'type': 'Feature',
              'id': feature.id,
              'geometry': feature.geometry,
              'properties': feature.properties
            });
          });
        });

        window.saveAs(
          new Blob([JSON.stringify(json)], {
            type: 'application/json;charset=utf-8'
          }),
          'export_features.json'
        );

        // return new Ember.RSVP.Promise((resolve) => {
        //   Ember.run(null, resolve, json);
        // }, 'MD: ExportSpatialData');

      } else {
        Ember.get(this, 'flashMessages')
          .warning('Found no features to export.');
      }
    }
  }
});