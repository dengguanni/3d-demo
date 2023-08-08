<template>
    <div id='box1' style="width:100vw; height:100vh; position: relative;">
        <div style="position: absolute">
            <button v-for="item in floorInfo" :key="item.floor" style="width: 100px; height: 50px; "
                @click="separateFloor(item)">{{ item.floor }}F</button>
        </div>
    </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import TWEEN from "@tweenjs/tween.js"
import { useRouter } from 'vue-router'
import { onMounted, ref, reactive, watch } from 'vue'
import mitt from '../../utils/mitt'
let scene = ''
let camera = ''
let renderer = ''
let controls = ''
let threeDom, raycaster, box
let positionY = 0
let chooseMesh = ''
let chooseFloor = ''
let initFloor
let initPosition = {
    camera: { x: -40.447722461124066, y: 53.31281548713603, z: 113.83720607206531 },
    target: { x: 0, y: 0, z: 0 },
    newCamera: { x: 0.5519710103983063, y: 81.1014796864695, z: 23.25713465484714 },
    newTarget: { x: 0.028025949885673883, y: 7.468069410659446, z: -15.526180630529343 }
}


export default {
    props: {
        clickFloor: {
            type: Number,
            default: 10
        }
    },
    setup(props) {
        const router = useRouter()
        let floorClick = ref(10)
        let floorStatus = ref(0)
        let isAnimateCamera = ref(true)
        const floorInfo = reactive([
            {
                floor: 1,
                addr: '/static/fbx/buiding/floor/1F.FBX',
                development: true,
                positionY: 0
            },
            {
                floor: 2,
                addr: '/static/fbx/buiding/floor/2F.FBX',
                development: true,
                positionY: 0
            },
            {
                floor: 3,
                addr: '/static/fbx/buiding/floor/3F.FBX',
                development: true,
                positionY: 0
            },
            {
                floor: 4,
                addr: '/static/fbx/buiding/floor/3F.FBX',
                development: false,
                positionY: 0
            },
            {
                floor: 5,
                addr: '/static/fbx/buiding/floor/3F.FBX',
                development: false,
                positionY: 0
            },
            {
                floor: 6,
                addr: '/static/fbx/buiding/floor/3F.FBX',
                development: false,
                positionY: 0
            },
            {
                floor: 7,
                addr: '/static/fbx/buiding/floor/7F.FBX',
                development: true,
                positionY: 0
            },
            {
                floor: 8,
                addr: '/static/fbx/buiding/floor/8F.FBX',
                development: true,
                positionY: 0
            },
            {
                floor: 9,
                addr: '/static/fbx/buiding/floor/9F.FBX',
                development: true,
                positionY: 0
            },
            {
                floor: 10,
                addr: '/static/fbx/buiding/floor/10F.FBX',
                development: true,
                positionY: 0
            }
        ])
        watch(floorClick, (newV, oldV) => {
            if (oldV) {
                if (newV > oldV) {
                    floorStatus.value = 1
                    separateFloor(chooseMesh)
                } else {
                    floorStatus.value = 2
                    separateFloor(chooseMesh)

                }
            }
        }, { immediate: true }
        )
        watch(() => props.clickFloor, (newV) => {
            console.log(newV)
            animate()
            initFloor = floorInfo.find(f => f.floor === newV)
            separateFloor(initFloor)
        })
        onMounted(() => {
            init()
        })
        const init = () => {
            threeDom = document.getElementById("box1")
            initScene()
            initCamera()
            initLight()
            initRenderer()
            initControls()
            initContent()
            initRaycaster()
        }

        const initScene = () => {
            scene = new THREE.Scene()
            scene.background = new THREE.Color(0x3a3f48)
        }
        //照相机
        const initCamera = () => {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 8000)
            camera.position.set(-40.447722461124066, 53.31281548713603, 113.83720607206531) //设置相机位置
        }
        //光
        const initLight = () => {
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
            hemiLight.position.set(0, 200, 0)
            scene.add(hemiLight)
            const dirLight = new THREE.DirectionalLight(0xffffff)
            dirLight.position.set(0, 200, 100)
            scene.add(dirLight)
        }
        //渲染器
        const initRenderer = () => {
            renderer = new THREE.WebGLRenderer({ antialias: true })
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(window.innerWidth, window.innerHeight) //渲染范围
            console.log(window.innerWidth, window.innerHeight)
            if (renderer.domElement.transferControlToOffscreen !== null) {
                console.log('当前浏览器支持 OffscreenCanvas')
            } else {
                console.log('当前浏览器不支持 OffscreenCanvas')
            }
            threeDom.appendChild(renderer.domElement) //body元素中插入canvas对象
        }
        //控制器
        const initControls = () => {
            controls = new OrbitControls(camera, renderer.domElement)
            controls.maxPolarAngle = 0.9 * Math.PI / 2
        }
        //内容
        const initContent = () => {
            //创建网格模型
            const mesh = new THREE.Mesh() //网格模型对象Mesh
            scene.add(mesh)
            //平行网格
            const gridHelper = new THREE.GridHelper(5000, 60, 0x0000ff, 0x0000ff) //网格模型对象（面积，大小，颜色颜色）
            gridHelper.position.set(0, -100, 0)
            scene.add(gridHelper)
            const fbxloader = new FBXLoader()
            // 插入模型
            positionY = 0
            let i = 0
            floorInfo.map((item, ind) => {
                fbxloader.load(item.addr, (mesh) => {
                    box = new THREE.BoxHelper(mesh, 0xFF333)
                    box.linewidth = 10.0
                    box.userData.info = item
                    const group = new THREE.Group()
                    group.name = 'floor'
                    group.rotation.x = -  Math.PI / 2
                    group.position.y = (ind + 1) * 4
                    item.positionY = (ind + 1) * 4
                    mesh.userData.info = item
                    mesh.traverse(child => {
                        child.userData.info = item
                    })
                    box.visible = false
                    scene.add(group)
                    group.add(mesh)
                    group.add(box)
                    group.userData.info = item
                    i++
                    // if (i === 10) {
                    //     initFloor = floorInfo.find(f => f.floor === chooseFloor)
                    //     console.log('initFloorinitFloorinitFloor',initFloor)
                    //     separateFloor(initFloor)
                    // }
                })
            })
        }
        const separateFloor = (mesh) => {
            console.log('separateFloor, meshm', mesh)
            floorClick.value = mesh.floor
            chooseMesh = mesh
            moveFloor(mesh)
            if (isAnimateCamera.value) {
                animateCamera(initPosition.camera, initPosition.newCamera, initPosition.target, initPosition.newTarget)
            } else {
                animateCamera(camera.position, initPosition.newCamera, controls.target, initPosition.newTarget)
            }
            isAnimateCamera.value = false
        }
        // 移动楼层
        const moveFloor = (floor) => {
            const floorU = []
            const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            for (let i = chooseFloor ? chooseFloor : floor.floor + 1; i <= floorInfo.length; i++) {
                floorU.push(i)
            }
            const floorD = floors.filter((v) => { return floorU.indexOf(v) == -1 })
            if (floorStatus.value === 2) {
                floorDown(floorD, floorU, floor)
            } else {
                floorUp(floorD)
            }
            floorStatus.value = 0
            chooseFloor = null
        }
        const floorUp = (floorDown) => {
            scene.children.forEach(v => {
                if (v.type == 'Group' && v.name === 'floor') {
                    floorDown.forEach(i => {
                        if (i === v.userData.info.floor) {
                            animateFloor(v.position.y, (v.userData.info.positionY), v)
                        }
                    })
                }
            })
        }
        const floorDown = (floorDown, floorUp, floor) => {
            scene.children.forEach(v => {
                if (v.type == 'Group' && v.name === 'floor') {
                    floorDown.forEach(i => {
                        if (i === v.userData.info.floor) {
                            v.position.y = v.userData.info.positionY
                            let height = 40 - floor.positionY
                            animateFloor(v.position.y, (v.position.y + height), v)
                        }

                    })
                    floorUp.forEach(i => {
                        if (i === v.userData.info.floor) {
                            animateFloor(v.position.y, (v.position.y + 100), v)
                        }
                    })
                }
            })
        }
        //射线
        const initRaycaster = () => {
            raycaster = new THREE.Raycaster()
            //射线原点
            const rayOrigin = new THREE.Vector3(0, 0, 0)
            //射线方向
            const rayDirection = new THREE.Vector3(0, 10, 0)
            //将该向量的方向设置为和原向量相同，但是其长度
            rayDirection.normalize()
            raycaster.set(rayOrigin, rayDirection)
            const mouse = new THREE.Vector2()
            threeDom.addEventListener("mousemove", (event) => {
                //数据标准化  window.innerWidth, window.innerHeight
                let x = (event.clientX / window.innerWidth * 2) - 1
                let y = -(event.clientY / window.innerHeight * 2) + 1
                mouse.set(x, y)
                raycaster.setFromCamera(mouse, camera)
                let intersects = raycaster.intersectObject(scene, true)
                if (intersects.length > 0) {
                    let res = intersects.filter(function (res) {
                        return res && res.object
                    })[0]
                    if (res && res.object.userData.info) {
                        scene.children.forEach(v => {
                            if (v.type === 'Group') {
                                v.children.forEach(val => {
                                    if (val.type === 'BoxHelper' && res.object.userData.info.floor === val.userData.info.floor) {
                                        val.visible = true
                                    } else if (val.type === 'BoxHelper') {
                                        val.visible = false
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
        const animateFloor = (currentY, targetY, mesh) => {
            const tween = new TWEEN.Tween({
                y: currentY // 相机当前位置y
            })
            tween.to({
                y: targetY // 新的相机位置y
            }, 1000)
            tween.onUpdate(function (obj) {
                mesh.position.y = obj.y
                controls.update()
            })
            tween.easing(TWEEN.Easing.Cubic.InOut)
            tween.start()
        }
        // tween转视角
        const animateCamera = (current1, target1, current2, target2) => {
            const tween = new TWEEN.Tween({
                x1: current1.x, // 相机当前位置x
                y1: current1.y, // 相机当前位置y
                z1: current1.z, // 相机当前位置z
                x2: current2.x, // 控制当前的中心点x
                y2: current2.y, // 控制当前的中心点y
                z2: current2.z  // 控制当前的中心点z
            })
            tween.to({
                x1: target1.x, // 新的相机位置x
                y1: target1.y, // 新的相机位置y
                z1: target1.z, // 新的相机位置z
                x2: target2.x, // 新的控制中心点位置x
                y2: target2.y, // 新的控制中心点位置x
                z2: target2.z  // 新的控制中心点位置x
            }, 1000)
            tween.onUpdate(function (object) {
                camera.position.x = object.x1
                camera.position.y = object.y1
                camera.position.z = object.z1
                controls.target.x = object.x2
                controls.target.y = object.y2
                controls.target.z = object.z2
                controls.update()
            })
            tween.onComplete(function () {
                controls.enabled = true
            })
            tween.easing(TWEEN.Easing.Cubic.InOut)
            tween.start()
        }
        //帧
        const animate = () => {
            controls.update()
            //执行渲染操作   指定场景、相机作为参数
            renderer.render(scene, camera)
            requestAnimationFrame(animate)
            TWEEN.update()
        }
        return {
            floorInfo,
            separateFloor
        }
    }
}
</script>
<style scoped>
</style>
