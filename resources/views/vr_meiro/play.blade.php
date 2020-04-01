<html>

<head>
    <script src="{{ mix('js/vr_meiro/play.js') }}"></script>
</head>

<body>
    <a-scene id="scene">
        <a-entity id="rig" movement-controls="constrainToNavMesh: true; speed:0.1">
            <a-entity id="camera" camera look-controls="pointerLockEnabled: true" position="0 1 0"></a-entity>
        </a-entity>
        <a-entity id="maze" position="0 0 0">
        </a-entity>
        <a-entity id="stage">
        </a-entity>
        <a-plane  rotation="-90 0 0" width="100" height="100" color="#7BC8A4"></a-plane>
        <a-sky color="#ECECEC"></a-sky>
    </a-scene>
</body>

</html>