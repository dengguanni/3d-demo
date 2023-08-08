<template>
    <div id="box" style="width: 100%; height: 100vh;">
    </div>
</template>
<script >
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { onMounted, ref, reactive, onUnmounted, watch } from 'vue'
let scene, camera, renderer, controls, threeDom, questId, box, mesh, boxGroup
let rayOrigin, rayDirection, mouse, textures = [], geometry, material, point
export default {
    setup() {
        onMounted(() => {
            init()
        })
        onUnmounted(() => {
            // questId = null
        })
        const init = () => {
            threeDom = document.getElementById("box")
            initScene()
            initCamera()
            initLight()
            initRenderer()
            initControls()
            initContent()
            // initRaycaster()
            animate()
        }
        const initScene = () => {
            scene = new THREE.Scene()
            scene.castShadow = true
            scene.background = new THREE.Color(0x3a3f48)
        }
        //照相机
        const initCamera = () => {
            camera = new THREE.PerspectiveCamera(45, threeDom.clientWidth / threeDom.clientHeight, 10, 10000)
            camera.position.set(-112.25874834732195, 118.14841363594252, 126.47100122126596)
        }
        //光
        const initLight = () => {
            const directionalLight = new THREE.DirectionalLight(0xFFB6C1, 0.3)
            directionalLight.position.set(1000, 1000, 1000)
            scene.add(directionalLight)
        }
        //渲染器
        const initRenderer = () => {
            renderer = new THREE.WebGLRenderer({ antialias: true })
            renderer.shadowMap.enabled = true //阴影设置
            renderer.shadowMap.type = THREE.PCFSoftShadowMap //阴影设置
            renderer.outputEncoding = THREE.sRGBEncoding
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(threeDom.clientWidth, threeDom.clientHeight) //渲染范围
            if (renderer.domElement.transferControlToOffscreen !== null) {
                console.log('当前浏览器支持 OffscreenCanvas')
            } else {
                console.log('当前浏览器不支持 OffscreenCanvas')
            }
            threeDom.appendChild(renderer.domElement)
        }
        //控制器
        const initControls = () => {
            controls = new OrbitControls(camera, renderer.domElement)
            controls.target = new THREE.Vector3(-9.285333821434596, 13.193127750652144, -9.598739179565602)
            controls.maxPolarAngle = 0.9 * Math.PI / 2 //控制无法看在底下
            controls.maxDistance = 210 //限制放大多少
        }
        const initContent = () => {
            let fbxloader = new FBXLoader()
            const geometry = new THREE.CylinderGeometry(1, 1, 20, 20);
            let texture = new THREE.TextureLoader().load("/static/jpg/tietu4.png")
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 8)
            texture.needsUpdate = true
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                transparent: true,

            })
            // const material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true });
            let cylinder = new THREE.Mesh(geometry, material);
            geometry.openEnded = true
            scene.add(cylinder);
        }
        const animate = () => {
            controls.update()
            //执行渲染操作   指定场景、相机作为参数
            renderer.render(scene, camera)
            questId = requestAnimationFrame(animate)
            // const dailog = document.getElementById('dailog')

        }
        return {

        }
    }
}

</script>