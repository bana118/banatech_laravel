<html>

<head>
    <script src="{{ mix('js/vr_meiro/play.js') }}"></script>
</head>

<body>
    <a-scene id="scene">
        <a-assets>
            <img id="gate-close" src="{{ asset('img/vr_meiro/mon_gate_western_close.png') }}">
            <img id="gate-open" src="{{ asset('img/vr_meiro/mon_gate_western_open_half.png') }}">
        </a-assets>
        <a-entity id="rig" position = "1.3 0.3 1.3" position-reader movement-controls="constrainToNavMesh: true; speed:0.1">
            <a-entity id="camera" position = "0 0.3 0" camera look-controls="pointerLockEnabled: true" position="0 0.3 0"></a-entity>
        </a-entity>
        <a-entity id="maze" position="0 0 0">
        </a-entity>
        <a-plane rotation="-90 0 0" width="100" height="100" color="#00FF00"></a-plane>
        <a-sky color="#ECECEC"></a-sky>
    </a-scene>
</body>

</html>