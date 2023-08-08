<template>
    <div id='box' style="width:100%; height:100vh; position: relative;">
        <div style="position: absolute;">
            <div v-if="!modelInfo !== []">
                <button v-for="item in modelInfo" :key="item.name" style="height: 50px ;width: auto"
                    @click="goMnitor(item)">去{{ item.name }}</button>
                <button style="height: 50px ;width: auto" @click="recoveryPosition()">恢复</button>
            </div>
            <div>
                <button v-for="item in models" :key="item.label" style="height: 50px ;width: auto;"
                    @click="chooseModel(item)">{{ item.label }}</button>
            </div>
            <button style="height: 50px; width:auto" @click="changePattern()">模式切换</button>
        </div>
    </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import TWEEN from "@tweenjs/tween.js"
import { onMounted, ref, reactive, onUnmounted } from 'vue'
let scene, mixer
let camera = ''
let renderer, id
let controls, modelStatus = false
let threeDom, currentModel, fictitiousModel
let currentPosition = {
    cameraPosition: { x: -16.127945759952553, y: 273.6769349278035, z: 1359.7374429475904 },
    targetPosition: { x: 35.8878998683702, y: -1.5617767285135988, z: -1.5321635697591238 }
}
let originPosition = {
    cameraPosition: { x: -16.127945759952553, y: 273.6769349278035, z: 1359.7374429475904 },
    targetPosition: { x: 35.887899868370, y: -1.5617767285135988, z: -1.5321635697591238 }
}
const clock = new THREE.Clock()
export default {
    setup() {
        onMounted(() => {
            init()
        })
        onUnmounted(() => {
            id = null
        })
        let modelInfo = ref([])
        let models = reactive([
            {
                path: '/static/fbx/modelviewing/GDX6.FBX',
                label: '卷接包机GDX6',
                positions: {
                    rotationX: - Math.PI / 2,
                    positionY: 150,
                    rotationZ: Math.PI
                },
                info: {
                    child: [
                        {
                            name: 'Box1807',
                            cameraPosition: { x: 44.887939538737434, y: 213.7833933865777, z: 115.93464506660604 },
                            targetPosition: { x: -34.0246926247362, y: 109.17325539921833, z: -59.88696963428435 }
                        },
                        {
                            name: '对象1125',
                            cameraPosition: { x: 591.0693852527925, y: 255.41759279883917, z: -256.0487846935414 },
                            targetPosition: { x: 193.509254956995, y: 208.40507300273651, z: -189.62404815642344 }
                        }]
                }
            },
            {
                path: '/static/fbx/modelviewing/SBNE.FBX',
                label: '卷接包机SBNE',
                positions: {
                    rotationX: - Math.PI / 2,
                    positionY: 180
                },
                info: {
                    child: [
                        {
                            name: '对象118',
                            cameraPosition: { x: 133.04934200982572, y: 383.4808772026197, z: 214.50728186218353 },
                            targetPosition: { x: -57.0840990691332, y: 201.75390019837045, z: -40.35464638920777 }
                        },
                        {
                            name: 'Rectangle418',
                            cameraPosition: { x: -2.487836617708531, y: 432.3516043209563, z: -369.6550545957488 },
                            targetPosition: { x: 52.25010117093768, y: 0, z: 14.730888128861105 }
                        }]
                }
            },
            {
                path: '/static/fbx/modelviewing/S2000.FBX',
                label: '封箱机S2000',
                positions: {
                    rotationX: - Math.PI / 2,
                    rotationZ: - Math.PI
                },
                info: {
                    child: [
                        {
                            name: 'Rectangle392',
                            cameraPosition: { x: -443.9630263703593, y: 153.5057438348285, z: 536.0362324201161 },
                            targetPosition: { x: -229.97339501694316, y: -88.9672368268215, z: -59.59951915690308 }
                        },
                        {
                            name: 'Group013',
                            cameraPosition: { x: 316.7756820280922, y: 250.58995806316815, z: 167.9414709708716 },
                            targetPosition: { x: -186.40384029716574, y: -106.1328980119703, z: -112.99594109907231 }
                        }]
                }
            },
            {
                path: '/static/fbx/modelviewing/FK350.FBX',
                label: '封箱机FK350',
                positions: {
                    positionY: 110
                },
                info: {
                    child: [
                        {
                            name: '组449',
                            cameraPosition: { x: -385.8712598214808, y: 108.42990273065152, z: 575.2868870458259 },
                            targetPosition: { x: -204.16182461937046, y: -157.16282526395742, z: -103.25856484310373 }
                        },
                        {
                            name: '对象286',
                            cameraPosition: { x: 27.165571540474673, y: 157.22998637436078, z: 233.91112392951092 },
                            targetPosition: { x: -385.6568111752456, y: 7.424131075433243, z: 57.396220818632436 }
                        }]
                }
            }
        ])
        const init = () => {
            threeDom = document.getElementById("box")
            initScene()
            initCamera()
            initLight()
            initRenderer()
            initControls()
            initContent()
            // getCamera()
            animate()
        }
        const initScene = () => {
            scene = new THREE.Scene()
            scene.background = new THREE.Color(0x003399)
        }
        //照相机
        const initCamera = () => {
            camera = new THREE.PerspectiveCamera(50, threeDom.clientWidth / threeDom.clientHeight, 1, 7000)
            camera.position.set(51.195743054471365, 798.1573319341936, 1409.9324689359953)
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
            renderer.outputEncoding = THREE.sRGBEncoding
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(threeDom.clientWidth, threeDom.clientHeight)
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
            controls.target.set(0, 40, 0)
        }
        //内容
        const initContent = () => {
            addModel()
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
            })
        }
        const getCamera = () => {
            window.addEventListener('click', () => {
                console.log('camera', camera)
                console.log('controls', controls)
            })
        }
        // 添加模型
        let addModel = () => {
            let fbxloader = new FBXLoader()
            fbxloader.material
            //插入模型
            let i = 0
            models.forEach((val) => {
                fbxloader.load(val.path, (group) => {
                    if (val.positions.rotationX) group.rotation.x = val.positions.rotationX
                    if (val.positions.positionY) group.position.y = val.positions.positionY
                    if (val.positions.rotationZ) group.rotation.z = val.positions.rotationZ
                    group.visible = false
                    group.name = val.label
                    console.log('已加载', val.label)
                    scene.add(group)
                    const group2 = groupCopy(group)
                    group2.name = val.label + '虚拟模式'
                    group2.visible = false
                    group2.userData.name = val.label
                    group2.userData.modelInfomation = val
                    modelClone(group, group2)
                    scene.add(group2)
                    i++
                    console.log(i)
                    if (i === 4) chooseModel()
                })
            })
            // chooseModel()
        }
        //添加监控信息
        const setMnitorInfo = (object, modelInfomation) => {
            object.children.map(child => {
                modelInfomation.info.child.forEach(v => {
                    if (child.name === v.name) {
                        console.log('v.name', v.name)
                        const info = {
                            name: child.name,
                            position: child.position,
                            context: '我是监控' + child.name,
                            targetPosition: v.targetPosition,
                            cameraPosition: v.cameraPosition
                        }
                        modelInfo.value.push(info)
                    }
                })
                if (child.children && child.children.length > 0) {
                    setMnitorInfo(child, modelInfomation)
                }
            })
        }
        //模型透明模式
        const setMaterial = (child) => {
            child.color = new THREE.Color("#006699")
            child.transparent = true // 是否开启使用透明度
            child.opacity = 0.1 // 透明度
            child.depthWrite = false // 关闭深度写入 透视效果
            child.side = THREE.DoubleSide // 双面显示
        }
        //添加精灵材质(监控)
        let addSprite = (mesh) => {
            let spriteMap = new THREE.TextureLoader().load('/static/jpg/jiankong.png')
            let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff })
            modelInfo.value.forEach(item => {
                let sprite = new THREE.Sprite(spriteMaterial)
                sprite.scale.set(50, 50, 50)
                sprite.position.set(item.position.x, item.position.y, item.position.z)
                mesh.add(sprite)
            })
        }
        // 添加文字
        const addText = (message, parameters, positions) => {
            if (parameters === undefined) parameters = {}
            // eslint-disable-next-line no-prototype-builtins
            const fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial"
            /* 字体大小 */
            // eslint-disable-next-line no-prototype-builtins
            const fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18
            /* 边框厚度 */
            // eslint-disable-next-line no-prototype-builtins
            const borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 5
            /* 边框颜色 */
            // eslint-disable-next-line no-prototype-builtins
            const borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : {
                r: 0,
                g: 0,
                b: 0,
                a: 1.0
            }
            /* 背景颜色 */
            // eslint-disable-next-line no-prototype-builtins
            const backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : {
                r: 255,
                g: 255,
                b: 255,
                a: 1.0
            }
            /* 创建画布 */
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            /* 字体加粗 */
            context.font = "Bold " + fontsize + "px " + fontface
            /* 获取文字的大小数据，高度取决于文字的大小 */
            const metrics = context.measureText(message)
            const textWidth = metrics.width
            /* 背景颜色 */
            context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," +
                backgroundColor.a + ")"
            /* 边框的颜色 */
            context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor
                .a + ")"
            context.lineWidth = borderThickness
            /* 绘制圆角矩形 */
            roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 +
                borderThickness, 6)
            /* 字体颜色 */
            context.fillStyle = "rgba(0, 0, 0, 1.0)"
            context.fillText(message, borderThickness, fontsize + borderThickness)
            /* 画布内容用于纹理贴图 */
            const texture = new THREE.Texture(canvas)
            texture.needsUpdate = true
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture
            })
            const sprite = new THREE.Sprite(spriteMaterial)
            /* 缩放比例 */
            sprite.scale.set(500, 250, 0)
            sprite.center = new THREE.Vector2(0, 0)
            sprite.scale.set(100, 100)
            sprite.name = '123'
            sprite.position.set(positions.x, positions.y, positions.z)
            sprite.opacity = 0.5
            return sprite
        }
        /* 绘制圆角矩形 */
        const roundRect = (ctx, x, y, w, h, r) => {
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + w - r, y)
            ctx.quadraticCurveTo(x + w, y, x + w, y + r)
            ctx.lineTo(x + w, y + h - r)
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
            ctx.lineTo(x + r, y + h)
            ctx.quadraticCurveTo(x, y + h, x, y + h - r)
            ctx.lineTo(x, y + r)
            ctx.quadraticCurveTo(x, y, x + r, y)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
        // 获取TargetPosition
        const getTargetPosition = (mesh) => {
            const position = mesh.position
            function getPOsition(mesh) {
                if (mesh.parent) {
                    position.x += mesh.parent.position.x
                    position.y += mesh.parent.position.y
                    position.z += mesh.parent.position.z
                    getPOsition(mesh.parent)
                } else {
                    position.x += mesh.position.x
                    position.y += mesh.position.y
                    position.z += mesh.position.z
                }
            }
            getPOsition(mesh)
            return position
        }
        // 点击模型
        const chooseModel = (val) => {
            val = val || { label: '卷接包机GDX6' }
            recoveryPosition()
            scene.children.forEach((child) => {
                // if(!val) val.label = '卷接包机GDX6'
                if (child.type === 'Group' && val.label === child.name) {
                    console.log(val.label)
                    currentModel = child
                    scene.children.forEach(v => {
                        if (v?.userData?.name === currentModel?.name) {
                            modelInfo.value = []
                            setMnitorInfo(v, v.userData.modelInfomation)
                        }
                    })
                    setAnimationMixer(child)
                    child.visible = true
                } else if (child.type === 'Group') {
                    child.visible = false
                }
            })
            modelStatus = true
            changePattern()
        }
        // 动画
        const setAnimationMixer = (child) => {
            mixer = new THREE.AnimationMixer(child)
            const action = mixer.clipAction(child.animations[0])
            action.play()
        }
        // 去监控点
        const goMnitor = (mesh) => {
            !modelStatus && changePattern()
            animateCamera(currentPosition.cameraPosition, mesh.cameraPosition, currentPosition.targetPosition, mesh.targetPosition)
            currentPosition = { targetPosition: mesh.targetPosition, cameraPosition: mesh.cameraPosition }
        }
        // 恢复
        const recoveryPosition = () => {
            animateCamera(currentPosition.cameraPosition, originPosition.cameraPosition, currentPosition.targetPosition, originPosition.targetPosition)
            currentPosition = originPosition
        }
        // tween转视角
        const animateCamera = (currentCamera, newCamera, currentTarget, newTarget) => {
            const tween = new TWEEN.Tween({
                x1: currentCamera.x,
                y1: currentCamera.y,
                z1: currentCamera.z,
                x2: currentTarget.x,
                y2: currentTarget.y,
                z2: currentTarget.z
            })
            tween.to({
                x1: newCamera.x,
                y1: newCamera.y,
                z1: newCamera.z,
                x2: newTarget.x,
                y2: newTarget.y,
                z2: newTarget.z
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
        // 切换模式
        const changePattern = () => {
            modelStatus = !modelStatus
            if (modelStatus) {
                currentModel.visible = false
                scene.children.forEach(child => {
                    if (child.type === 'Group' && child?.userData?.name === currentModel?.name) {
                        setAnimationMixer(child)
                        fictitiousModel = child
                        child.visible = true
                        child.traverse(v => {
                            if (v.material) {
                                Array.isArray(v.material) ? v.material.forEach(m => setMaterial(m)) :
                                    setMaterial(v.material)
                            }
                        })
                        let spriteOrigin
                        modelInfo.value.forEach(item => {
                            spriteOrigin = addText(item.context,
                                {
                                    fontsize: 25,
                                    borderColor: { r: 255, g: 0, b: 0, a: 0.4 },/* 边框黑色 */
                                    backgroundColor: { r: 255, g: 255, b: 255, a: 0.9 }/* 背景颜色 */
                                }, item.position)
                            child.add(spriteOrigin)
                        })
                        addSprite(child)
                    }
                })
            } else {
                setAnimationMixer(currentModel)
                currentModel.visible = true
                if (fictitiousModel) fictitiousModel.visible = false
            }
        }
        // 克隆模型
        const modelClone = (models, model) => {
            let cloneModel = {}
            models.children.forEach(v => {
                if (v.isMesh) {
                    cloneModel = v.clone()
                    cloneModel.material = materialClone(cloneModel.material, v.material)
                    cloneModel.children = [];
                    cloneModel.parent = model
                    if (v.children.length > 0) modelClone(v, cloneModel)
                    model.children.push(cloneModel)
                } else {
                    let cv = groupCopy(v)
                    cv.parent = model
                    modelClone(v, cv)
                    model.children.push(cv)
                }
            })
        }
        // group 复制
        const groupCopy = (obj) => {
            let group = new THREE.Group()
            let key = ["matrix", "matrixWorld", "position", "quaternion", "rotation", "scale", "up", "modelViewMatrix", "normalMatrix"]
            key.forEach(v => {
                group[v].copy(obj[v])
            })
            obj.animations.forEach(v => {
                group.animations.push(v.clone())
            })
            group.name = obj.name
            group.userData = JSON.parse(JSON.stringify(obj.userData))
            return group
        }
        // 材质复制
        const materialClone = (material, cloneM) => {
            if (Array.isArray(material)) {
                return material.map((val, ci) => {
                    return val = cloneM[ci].clone()
                })
            }
            material = cloneM.clone()
            return material
        }
        //帧
        const animate = () => {
            TWEEN.update()
            controls.update()
            renderer.render(scene, camera)
            id = requestAnimationFrame(animate)
            if (mixer) mixer.update(clock.getDelta())
        }
        return {
            modelInfo,
            goMnitor,
            recoveryPosition,
            models,
            chooseModel,
            changePattern
        }
    }
}
</script>
<style>
</style>