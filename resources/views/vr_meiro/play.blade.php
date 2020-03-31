<html>

<head>
    <script src="{{ mix('js/vr_meiro/play.js') }}"></script>
</head>

<body>
    <a-scene>
        <a-entity id="maze" position="-4 1 -10">
            <a-box class="collidable" position="0 0 0" width="1" height="2" depth="1" color="#4CC3D9"></a-box>
            <a-box class="collidable" position="0 0 1" width="1" height="2" depth="1" color="#4CC3D9"></a-box>
            <a-box class="collidable" position="0 0 2" width="1" height="2" depth="1" color="#4CC3D9"></a-box>
            <a-box class="collidable" position="0 0 3" width="1" height="2" depth="1" color="#4CC3D9"></a-box>
            <a-box class="collidable" position="8 0 7" width="1" height="2" depth="1" color="#4CC3D9"></a-box>
            <a-box class="collidable" position="8 0 8" width="1" height="2" depth="1" color="#4CC3D9"></a-box>
        </a-entity>
        <a-plane rotation="-90 0 0" width="100" height="100" color="#7BC8A4" static></a-plane>
        <a-sky color="#ECECEC"></a-sky>
    </a-scene>
</body>

</html>