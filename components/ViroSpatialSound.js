/**
 * Copyright (c) 2017-present, Viro Media, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ViroSpatialSound
 * @flow
 */
'use strict';

import { requireNativeComponent, View, Platform, findNodeHandle } from 'react-native';
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
import React from 'react';

var PropTypes = React.PropTypes;
var NativeModules = require('react-native').NativeModules;
var RCT_SPATIALSOUND_REF = 'virospatialsoundcomponent';

var ViroSpatialSound = React.createClass({
  propTypes: {
    ...View.propTypes,

    // Source can either be a String referencing a preloaded file, a web uri, or a
    // local js file (using require())
    source: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        uri: PropTypes.string,
      }),
      // Opaque type returned by require('./sound.mp3')
      PropTypes.number,
    ]).isRequired,

    paused: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    volume: PropTypes.number,
    position: PropTypes.arrayOf(PropTypes.number),
    rolloffModel: PropTypes.string,
    minDistance: PropTypes.number,
    maxDistance: PropTypes.number,
    onFinish: React.PropTypes.func,
    onError: React.PropTypes.func,
  },

  _onFinish: function(event: Event) {
    this.props.onFinish && this.props.onFinish(event);
  },

  _onError: function(event: Event) {
    this.props.onError && this.props.onError(event);
  },

  render: function() {

    var soundSrc = this.props.source;
    if (typeof soundSrc === 'number') {
      soundSrc = resolveAssetSource(soundSrc);
    } else if (typeof soundSrc === 'string') {
      soundSrc = {name: soundSrc};
    }

    let nativeProps = Object.assign({}, this.props);
    nativeProps.ref = RCT_SPATIALSOUND_REF;
    nativeProps.source = soundSrc;
    nativeProps.onErrorViro = this._onError;
    nativeProps.onFinishViro = this._onFinish;

    if (Platform.OS === 'ios') {
      return (
        <VRTSound {...nativeProps} />
      );
    } else {
      return (
        <VRTSpatialSound {...nativeProps} />
      );
    }
  },

  getNodeHandle: function(): any {
    return findNodeHandle(this.refs[RCT_SPATIALSOUND_REF]);
  },

  seekToTime(timeInSeconds) {
    switch (Platform.OS) {
      case 'ios':
        NativeModules.VRTSpatialSoundManager.seekToTime(this.getNodeHandle(), timeInSeconds);
        break;
      case 'android':
        NativeModules.UIManager.dispatchViewManagerCommand(
            this.getNodeHandle(),
            NativeModules.UIManager.VRTSpatialSound.Commands.seekToTime,
            [ timeInSeconds ]);
        break;
    }
  },

});

var VRTSound= requireNativeComponent(
  'VRTSound', ViroSpatialSound, {
    nativeOnly: {
      onFinishViro: true,
      onErrorViro:true,
    }
  }
);

var VRTSpatialSound= requireNativeComponent(
  'VRTSpatialSound', ViroSpatialSound, {
    nativeOnly: {
      onFinishViro: true,
      onErrorViro: true,
    }
  }
);

module.exports = ViroSpatialSound;
