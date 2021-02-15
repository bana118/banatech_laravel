<html>

<head>
    <title>VR迷路</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="author" content="bana">
    <meta name="theme-color" content="#0033FF">
    <meta name="description" content="Webで遊べるVR迷路。ゾンビから逃げろ！">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#0033FF">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('img/favicon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('img/favicon/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('img/favicon/favicon-16x16.png') }}">
    <link rel="mask-icon" href="{{ asset('img/favicon/safari-pinned-tab.svg') }}" color="#5bbad5">
    <link rel="canonical" href="{{ url()->current() }}">
    <script src="{{ mix('js/vr_meiro/play.js') }}"></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="VR迷路" />
    <meta property="og:description" content="Webで遊べるVR迷路。ゾンビから逃げろ！" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
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
