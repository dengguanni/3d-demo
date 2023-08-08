<template>
    <div id='box' style="width:100vw;
        height:100vh; position: relative;" v-show="!isOpen">
        <div id="dailog" v-if="isShowDailog">{{ floorNum }}F</div>
    </div>
    <div v-show="isOpen">
        <stacked-buildings :clickFloor="clickFloor" />
    </div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { onMounted, ref, reactive, onUnmounted, watch } from 'vue'
import { Group } from '@tweenjs/tween.js'
import { useRouter } from 'vue-router'
import mitt from '../../utils/mitt'
import StackedBuildings from '../components/StackedBuildings.vue'
let scene, camera, renderer, controls, threeDom, questId, box, mesh, boxGroup
let rayOrigin, rayDirection, mouse, textures = [], geometry, material, point
const modelInfo = [
    {
        path: '../../public/static/fbx/buiding/naight/CLX.FBX',
        name: 'streamer', //流光
    },
    {
        path: '../../public/static/fbx/buiding/naight/JQL.FBX',
        name: 'internationalTodayBui', //今日国际建筑
    },
    {
        path: '../../public/static/fbx/buiding/naight/Ludeng.FBX',
        name: 'streetLamp',
    },
    {
        path: '../../public/static/fbx/buiding/naight/NDX.FBX',
        name: 'buildingFoundation', //建筑地基
    },
    {
        path: '../../public/static/fbx/buiding/naight/PL.FBX',
        name: 'smallBuildings',
        positions: {
            positionY: 15,
        }
    },
    {
        path: '../../public/static/fbx/buiding/naight/Shu.FBX',
        name: 'trees',
        positions: {
            positionY: 15,
            positionX: -300,
        }
    },
    {
        path: '../../public/static/fbx/buiding/naight/SSL.FBX',
        name: 'leftBuilding',
    },
    {
        path: '../../public/static/fbx/buiding/naight/WDX.FBX',
        name: 'road',
    },
    {
        path: '../../public/static/fbx/buiding/naight/XZL.FBX',
        name: 'bigBuilding',
    }
]
const manager = new THREE.LoadingManager()
export default {
    components: { StackedBuildings },
    setup() {
        let isShowDailog = ref(false)
        let isOpen = ref(false)
        const router = useRouter()
        onMounted(() => {
            init()
        })
        onUnmounted(() => {
            questId = null
        })
        const init = () => {
            threeDom = document.getElementById("box")
            initScene()
            initCamera()
            initLight()
            initRenderer()
            initControls()
            initContent()
            initRaycaster()
            animate()
        }
        let clickFloor = ref(10)
        let floor
        let floorNum = ref(10)
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
        //内容
        const initContent = () => {
            let fbxloader = new FBXLoader()
            let i = 0
            const modelWay = [{}, {}]
            modelInfo.forEach((val) => {
                fbxloader.load(val.path, (model) => {
                    model.name = val.name
                    const group = new THREE.Group()
                    if (model.name === 'bigBuilding') setFloorInfo(model)
                    if (val?.positions?.positionY) model.position.y = val.positions.positionY
                    if (val?.positions?.positionX) model.position.x = val.positions.positionX
                    if (val?.positions?.positionX) model.position.x = val.positions.positionX
                    model.rotation.z = Math.PI * 2
                    model.rotation.x = -Math.PI / 2
                    if (model.name === 'streamer') setStreamer(model)
                    i++
                    scene.add(model)
                    if (i === 9) setChild()
                })
            })
        }
        const setStreamer = (streamer) => {
            const map = '/static/jpg/line.png'
            streamer.children.forEach(child => {
                child.needsUpdate = true
                changeModelMap(map, child.material)
            })
        }
        // 设置楼层信息
        const setFloorInfo = (group) => {
            boxGroup = new THREE.Group()
            setBoxLine(9.7, 5.5, 1)
            setBoxLine(9.6, 15.2, 2)
            for (let i = 3; i < 12; i++) {
                setBoxLine(4.5, 22.2, i)
            }
            setBoxLine(11.2, 66.2, 12)
            boxGroup.name = 'floor'
            scene.add(boxGroup)
            // console.log('boxGroup', boxGroup)
        }
        // 设置楼层框框
        const setBoxLine = (boxHeight, positionY, floor) => {
            geometry = new THREE.BoxGeometry(53, boxHeight, 19)
            material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
            mesh = new THREE.Mesh(geometry, material)
            mesh.material.opacity = 0
            box = new THREE.BoxHelper(mesh, 0xFF333)
            box.name = floor
            mesh.add(box)
            mesh.position.x = 18.5
            mesh.position.z = 6
            if (floor > 2 && floor <= 11) {

                mesh.position.y = 22.2 + ((floor - 3) * 4.5)
            } else {
                mesh.position.y = positionY
            }
            mesh.rotation.y = 0.03
            mesh.name = floor
            mesh.visible = false
            boxGroup.add(mesh)
            // console.log(floor)
        }
        const changeModelMap = (map, obj) => {
            new THREE.TextureLoader().load(map, (texture) => {
                textures.push(texture)
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping
                if (obj) obj.map = texture
                texture.repeat.set(10, 2) //(越大线条越明显细，越小线条越长)

            })
        }
        // 设置灯光
        const setChild = () => {
            const modelNames = ['bigBuilding', 'internationalTodayBui', 'leftBuilding', 'buildingFoundation', 'streetLamp', 'road']
            const lightNames = {
                Light_01: '0xFFcc00', Light_00: '0xFFcc00', Light_09: '0xccffff',
                Light_08: '0xCCFFFF ', Light_06: '0xFFFFFF', Mesh001: '0xccffff', XZL_01: '0xFFFF00',
                Object004: '0xFFFF99', Light_05: '0xFFFF66', Light_07: '0xFFFF66', Light_04: '0xFFFF66', Line003: '0xcc6600'
            }
            const x = {
                Light_01: '0xFFcc00',
            }
            scene.children.forEach(child => {

                if (child.type === 'Group') {
                    child.children.forEach(v => {
                        if (v.name === 'Light_09' || v.name === 'Mesh001') {
                            v.material.color = new THREE.Color(0x00FFFF)
                            v.material.emissive = new THREE.Color(0x00FFFF) //材质的放射（光）颜色
                            // v.edgeGlow = 8
                            // v.material.emissiveIntensity = 2
                            // v.material.lightMapIntensity = 2
                            // v.material.flatShading = true
                            // v.material.refractionRatio = 2
                            // v.material.shininess = 2
                            // v.material.needsUpdate = true
                        }

                    })
                }
            })
        }
        //递归孩子
        const setShadow = (object) => {
            object.children.map(item => {
                item.castShadow = true
                item.receiveShadow = true
                if (item.material) {
                    item.material.transparent = true
                    item.material.shadowSide = THREE.BackSide
                    item.material.side = THREE.DoubleSide
                }
                if (item.children && item.children.length > 0) {
                    setShadow(item)
                }
            })
        }
        //射线
        const initRaycaster = () => {
            const raycaster = new THREE.Raycaster()
            //射线原点
            rayOrigin = new THREE.Vector3(0, 0, 0)
            //射线方向
            rayDirection = new THREE.Vector3(0, 10, 0)
            //将该向量的方向设置为和原向量相同，但是其长度
            rayDirection.normalize()
            raycaster.set(rayOrigin, rayDirection)
            mouse = new THREE.Vector2()
            window.addEventListener("mousemove", (event) => {
                //数据标准化
                let x = (event.clientX / threeDom.clientWidth * 2) - 1
                let y = -(event.clientY / threeDom.clientHeight * 2) + 1
                mouse.set(x, y)
                raycaster.setFromCamera(mouse, camera)
                if (!boxGroup) { return }
                let intersects = raycaster.intersectObject(boxGroup, true)
                if (intersects.length > 0) {
                    let res = intersects.filter(function (res) {
                        return res && res.object
                    })[0]
                    if (res.object.type === 'Mesh') {
                        boxGroup.children.forEach(child => {
                            if (child.name === res.object.name) {
                                floorNum.value = child.name
                                child.visible = true
                                point = child.position
                                isShowDailog.value = true
                            } else {
                                child.visible = false
                            }
                        })
                    }
                } else {
                    isShowDailog.value = false
                    boxGroup.children.forEach(child => {
                        child.visible = false
                    })
                }
            })
            window.addEventListener("click", (event => {
                if (!isShowDailog.value) return
                clickFloor.value = floorNum.value
                console.log()
                isOpen.value = !isOpen.value
            }))
        }
        //三维转二维
        const getPosition = (pos) => {
            let a = new THREE.Vector3(pos.x, pos.y, pos.z);
            let vector = a.project(camera);
            let halfWidth = threeDom.clientWidth / 2;
            let halfHeight = threeDom.clientHeight / 2;
            let result = {
                x: Math.round(vector.x * halfWidth + halfWidth),
                y: Math.round(-vector.y * halfHeight + halfHeight)
            }
            return result
        }
        //帧
        const animate = () => {
            controls.update()
            //执行渲染操作   指定场景、相机作为参数
            renderer.render(scene, camera)
            questId = requestAnimationFrame(animate)
            const dailog = document.getElementById('dailog')
            if (dailog && point) {
                dailog.style.top = getPosition(point).y + 'px'
                dailog.style.left = getPosition(point).x + 'px'
            }
            if (textures) {
                textures.forEach(v => {
                    v.offset.y += 0.001
                })
            }
        }
        return {
            floorNum,
            isOpen,
            isShowDailog,
            clickFloor
        }
    }
}
</script>

<style>
body {
    margin: 0px;
}

#dailog {
    width: 5%;
    height: 5%;
    background: rgb(73, 40, 140);
    position: absolute;
    opacity: 0.5;
    color: lawngreen;
    font-size: 50px;
}
</style>
