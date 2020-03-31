<html>

<head>
    <script src="{{ mix('js/vr_meiro/play.js') }}"></script>
</head>

<body>
    <a-scene>
    <a-entity camera look-controls position="0 10 0"></a-entity>
        <a-entity id="maze" position="0 0 0">
        </a-entity>
        <a-plane rotation="-90 0 0" width="100" height="100" color="#7BC8A4" static></a-plane>
        <a-sky color="#ECECEC"></a-sky>
    </a-scene>
</body>

</html>