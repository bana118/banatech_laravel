<html>

<head>
    <script src="{{ mix('/js/base/app.js') }}"></script>
    <script src="{{ mix('js/vr_meiro/play.js') }}"></script>
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="ばなてっく" />
    <meta property="og:description" content="VR迷路Web" />
    <meta property="og:image" content="{{ asset('img/sumnail/vr_meiro.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
    <!--for post form-->
    <meta name="csrf-token" content='@csrf'>
</head>

<body>
    <a-scene id="scene">
        <a-assets>
            <img id="gate-close-asset" src="{{ asset('img/vr_meiro/mon_gate_western_close.png') }}">
            <img id="gate-open-asset" src="{{ asset('img/vr_meiro/mon_gate_western_open_half.png') }}">
            <img id="red-key-asset" src="{{ asset('img/vr_meiro/red_key.png') }}">
            <img id="blue-key-asset" src="{{ asset('img/vr_meiro/blue_key.png') }}">
            <a-asset-item id="zombi-asset" src="{{ asset('other/vr_meiro/gltf/zombi/scene.gltf') }}"> </a-asset-item>
        </a-assets>
        <a-entity id="rig" position="1.3 0 1.3" position-reader rotation-controls
            movement-controls="constrainToNavMesh: true; speed:0.1">
            <a-entity id="camera" position="0 1.6 0" camera look-controls="pointerLockEnabled: true" position="0 0.3 0">
            </a-entity>
        </a-entity>
        <a-entity id="maze" position="0 0 0">
        </a-entity>
        <a-plane rotation="-90 0 0" width="100" height="100" color="#00FF00"></a-plane>
        <a-sky color="#ECECEC"></a-sky>
    </a-scene>
</body>

</html>
