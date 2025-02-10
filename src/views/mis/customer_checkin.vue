<template>
    <div v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item>
                <el-date-picker v-model="dataForm.date" type="date" placeholder="日付を選択する" :editable="false"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" :clearable="false" />
            </el-form-item>
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="氏名" maxlength="10" class="input" clearable="clearable" />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="電話番号" maxlength="11" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
                <el-button type="success" @click="checkinHandle()">健康診断の受付</el-button>
                <el-button type="danger" @click="finishHandle()">健康診断を受け終わる</el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button label="すべて"></el-radio-button>
                    <el-radio-button label="未記入"></el-radio-button>
                    <el-radio-button label="記入済み"></el-radio-button>
                    <el-radio-button label="終了"></el-radio-button>
                    <el-radio-button label="閉じました"></el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
                fixed />
            <el-table-column type="index" header-align="center" align="center" width="120" label="番号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="氏名" width="200" fixed />
            <el-table-column prop="sex" header-align="center" align="center" label="性别" width="100" />
            <el-table-column prop="age" header-align="center" align="center" label="年齢" width="100" />
            <el-table-column prop="tel" header-align="center" align="center" label="電話番号" width="150" />
            <el-table-column prop="pid" header-align="center" align="center" label="身分証番号" width="190" />
            <el-table-column prop="company" header-align="center" align="center" label="会社名" width="200" />
            <el-table-column prop="title" header-align="center" align="center" label="健診パッケージ" min-width="200" />
            <el-table-column prop="status" header-align="center" align="center" label="状態" width="120" />
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="text" :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
                        @click="guidanceHandle(scope.row.id)">
                        診察案内書
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <el-dialog title="健康診断の受付" v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:UPDATE'])" :close-on-click-modal="false"
        v-model="checkinDialog.visible" width="500px" :before-close="closeHandle">
        <div class="card-info">
            <div class="left">
                <el-form :model="checkinDialog.dataForm" ref="dialogForm" label-width="60px">
                    <el-form-item label="氏名">
                        <el-input v-model="checkinDialog.dataForm.name" />
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-input v-model="checkinDialog.dataForm.sex" />
                    </el-form-item>
                    <el-form-item label="身分証">
                        <el-input v-model="checkinDialog.dataForm.pid" />
                    </el-form-item>
                </el-form>
            </div>
            <div class="right">
                <img :src="checkinDialog.dataForm.photo_1" class="photo"
                    v-if="checkinDialog.dataForm.photo_1 != null" />
                <div class="empty" v-if="checkinDialog.dataForm.photo_1 == null">
                    <el-icon :size="60" class="icon">
                        <Avatar />
                    </el-icon>
                </div>
            </div>
        </div>
        <div class="photo-container">
            <div class="empty" v-show="checkinDialog.showEmpty">
                <SvgIcon name="camera" class="camera" />
                <ol>
                    <li>まず健康診断受診者の身分証をスキャンし、認証が成功すると自動的にカメラが起動します。</li>
                    <li>撮影する写真には、必ず一人だけの顔が映るよう注意してください。複数の顔が含まれているとエラーになります。</li>
                    <li>必ず健康診断受診者の正面写真を撮影してください。サングラスや顔を覆うアクセサリーの着用は禁止です。</li>
                </ol>
            </div>
            <video id="video" autoplay v-show="checkinDialog.showVideo"></video>
            <canvas id="photo" width="460" height="345" v-show="checkinDialog.showPhoto">
            </canvas>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" :icon="checkinDialog.btnIcon" :disabled="checkinDialog.showEmpty"
                    @click="takePhotoHandle">
                    {{ checkinDialog.btnText }}
                </el-button>
                <el-button @click="closeHandle">中止する</el-button>
                <el-button type="success"
                    :disabled="checkinDialog.dataForm.pid == null || checkinDialog.dataForm.photo_2 == null"
                    @click="dataFormSubmit">
                    受付
                </el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog title="体检导引单" v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])" v-model="guidanceDialog.visible"
        width="800px">
        <div class="guidance" id="pdfDom" :name="guidanceDialog.name">
            <h2 class="title">神州大健康の健康診断検査案内書</h2>
            <div class="summary">
                <table class="base-info">
                    <tr>
                        <td class="label">氏名:</td>
                        <td class="value">{{ guidanceDialog.name }}</td>
                        <td class="label">性别:</td>
                        <td class="value">{{ guidanceDialog.sex }}</td>
                        <td class="label">年齢:</td>
                        <td class="value">{{ guidanceDialog.age }}</td>
                    </tr>
                    <tr>
                        <td class="label">身分証:</td>
                        <td class="value">{{ guidanceDialog.pid }}</td>
                        <td class="label">電話番号:</td>
                        <td class="value">{{ guidanceDialog.tel }}</td>
                        <td class="label">日付:</td>
                        <td class="value">{{ guidanceDialog.date }}</td>
                    </tr>
                    <tr>
                        <td class="label">会社:</td>
                        <td colspan="5" class="value">
                            {{ guidanceDialog.company }}
                        </td>
                    </tr>
                </table>
                <img class="qrcode" :src="guidanceDialog.qrCodeBase64" />
            </div>
            <table class="checkup">
                <tr>
                    <th>番号</th>
                    <th align="left">診察場所</th>
                    <th align="left">検査項目</th>
                    <th>健康診断医師</th>
                </tr>
                <tr v-for="(one, index) in guidanceDialog.checkup">
                    <td align="center">{{ index + 1 }}</td>
                    <td>{{ one.place }}</td>
                    <td>{{ one.name }}</td>
                    <td></td>
                </tr>
            </table>
            <div class="desc">
                <p>ご注意ください：健康診断終了後10日以内に、神州大健康（ウェブサイト（http://www.szhis.com）で健康診断報告書をご確認いただけます。その後5営業日以内に、本健康診断センターから郵送された報告書をお受け取りいただけますので、必ずご確認ください！</p>
                <ul>
                    <li>
                        <el-icon>
                            <PhoneFilled />
                        </el-icon>
                        <span>健康診断相談：010-23891145</span>
                    </li>
                    <li>
                        <el-icon>
                            <PhoneFilled />
                        </el-icon>
                        <span>健康診断相談：010-23891145</span>
                    </li>
                    <li>
                        <el-icon>
                            <PhoneFilled />
                        </el-icon>
                        <span>健康診断相談：010-23891145</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="operate">
            <div class="operate">
                <el-button type="primary" size="large" :icon="Document" @click="getPdf()">
                    案内票をダウンロードする
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { Camera, RefreshRight, Document } from '@element-plus/icons-vue';
import router from '../../router/index';
import { dayjs } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';
import { imageBase64 } from '../../components/imageBase64';

dayjs.extend(isBetween);
const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    name: null,
    tel: null,
    date: dayjs().format('YYYY-MM-DD'),
    statusLabel: '全部',
    status: null
});

const dataRule = reactive({
    name: [{ pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '氏名の形式が誤っています' }],
    tel: [{ pattern: '^1[1-9]\\d{9}$', message: '電話番号の形式が誤っています' }]
});

const data = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

function loadDataList() {
    data.loading = true;
    if (dataForm.statusLabel == 'すべて') {
        dataForm.status = null;
    } else if (dataForm.statusLabel == '未記入') {
        dataForm.status = 1;
    } else if (dataForm.statusLabel == '記入済み') {
        dataForm.status = 2;
    } else if (dataForm.statusLabel == '終了') {
        dataForm.status = 3;
    }
    else if (dataForm.statusLabel == '閉じました') {
        dataForm.status = 4;
    }
    let json = {
        name: dataForm.name,
        tel: dataForm.tel,
        date: dataForm.date,
        status: dataForm.status,
        page: data.pageIndex,
        length: data.pageSize
    };

    proxy.$http('/mis/appointment/searchByPage', 'POST', json, true, function (resp: any) {
        let page = resp.page;
        let temp = {
            '1': '未記入',
            '2': '記入済み',
            '3': '終了',
            '4': '閉じました'
        };
        for (let one of page.list) {
            one.status = temp[one.status];
        }
        data.dataList = page.list;
        data.totalCount = page.totalCount;
        data.loading = false;
    });
}

loadDataList();

function searchHandle() {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.name == '') {
                dataForm.name = null;
            }
            if (dataForm.tel == '') {
                dataForm.tel = null;
            }
            if (data.pageIndex != 1) {
                data.pageIndex = 1;
            }
            loadDataList();
        } else {
            return false;
        }
    });
}

function sizeChangeHandle(val) {
    data.pageSize = val;
    data.pageIndex = 1;
    loadDataList();
}

function currentChangeHandle(val) {
    data.pageIndex = val;
    loadDataList();
}

const checkinDialog = reactive({
    visible: false,
    btnText: '撮影',
    btnIcon: Camera,
    showEmpty: true,
    showVideo: false,
    showPhoto: false,
    streamTrack: null,
    dataForm: {
        name: null,
        sex: null,
        pid: null,
        photo_1: null,
        photo_2: null
    }
});

function checkinHandle() {
    let current = dayjs().format("YYYY-MM-DD")
    if (current != dataForm.date) {
        proxy.$message({
            message: `日付を${current}に変更してください。`,
            type: 'warning',
            duration: 1200
        });
    }
    else {
        checkinDialog.dataForm.name = null;
        checkinDialog.dataForm.sex = null;
        checkinDialog.dataForm.pid = null;
        checkinDialog.dataForm.photo_1 = null;
        checkinDialog.dataForm.photo_2 = null;
        checkinDialog.showEmpty = true;
        checkinDialog.showVideo = false;
        checkinDialog.showPhoto = false;
        checkinDialog.visible = true;
    }

    _openCamera();
}

/*
 * 因为身份证信息先是用base16编码，然后再用base64编码。因为JS自带了base64解码函数，所以只需
 * 要我们定义base16解码的函数。
 */
function hex2a(hex) {
    let str_list = '';
    for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2) {
        const a = hex.charCodeAt(i);
        const b = hex.charCodeAt(i + 1);
        const c = b * 256 + a;
        str_list += String.fromCharCode(c);
    }

    return str_list.toString();
}

/*
 * 该函数用于把YYYYMMDD格式的日期字符串转换成YYYY-MM-DD格式
 */
function parseDateString(str, deco, zero) {
    let year = str.substr(0, 4);
    let month = str.substr(4, 2);
    let date = str.substr(6);
    if (zero) {
        month = month.substr(0, 1) === '0' ? month.substr(1) : month;
        date = date.substr(0, 1) === '0' ? date.substr(1) : date;
    }
    return `${year}${deco}${month}${deco}${date}`;
}

// const webUrl = 'ws://127.0.0.1:30004/ws';
// let ws = new WebSocket(webUrl);
// ws.onopen = function (evt) {
//     console.log('身份读取WebSocket已连接');
// };
// ws.onclose = function (evt) {
//     console.log('身份读取WebSocket已关闭');
// };
// ws.onmessage = function (messageEvent) {
//     if (!checkinDialog.visible || !checkinDialog.showEmpty) {
//         return;
//     }
//     //把读卡内容转换成JSON对象
//     const jsonObject = JSON.parse(messageEvent.data);

//     //Ret属性0代表成功，其他代表读卡失败
//     if (jsonObject.Ret == 0) {
//         //Cmd是10001代表被动接收读卡结果，10000代表主动读取身份证内容
//         if (jsonObject.Cmd == 10001) {
//             //获取UserParam信息
//             const userParam = JSON.parse(window.atob(jsonObject.UserParam));
//             //姓名（结尾包含空格，字符串总长度为15个字符，必须要去除结尾空格）
//             const name = hex2a(window.atob(userParam.CardInfo.Name)).trim();
//             //性别
//             const sex = hex2a(window.atob(userParam.CardInfo.Sex)) == 1 ? '男' : '女';
//             //身份证号
//             const pid = hex2a(window.atob(userParam.CardInfo.No));
//             //生日（例如19920315）
//             const temp = hex2a(window.atob(userParam.CardInfo.Birthday));
//             //转换生日格式
//             const birthday = parseDateString(temp, '-', true);
//             //照片
//             const image = 'data:image/jpg;base64,' + userParam.BmpInfo;
//             //起始有效期
//             const validityPeriodBegin = hex2a(window.atob(userParam.CardInfo.ValidityPeriodBegin));
//             const expiryBegin = parseDateString(validityPeriodBegin, '-', true);

//             //截止有效期
//             const validityPeriodEnd = hex2a(window.atob(userParam.CardInfo.ValidityPeriodEnd)).trim();
//             const expiryEnd = validityPeriodEnd !== '长期' ? parseDateString(validityPeriodEnd, '-', true) : validityPeriodEnd;
//             if (expiryEnd !== '长期') {
//                 //有效期范围
//                 let valid = dayjs().isBetween(expiryBegin, expiryEnd);
//                 if (!valid) {
//                     proxy.$message({
//                         message: '身份证已过期',
//                         type: 'error',
//                         duration: 1200
//                     });
//                     return
//                 }
//             }
//             //比对身份证信息与体检人信息是否一致（这里是新补充的代码）
//             let json = {
//                 name: name,
//                 sex: sex,
//                 pid: pid
//             }
//             proxy.$http('/mis/appointment/hasAppointInToday', 'POST', json, true, function (resp) {
//                 let result = resp.result;
//                 if (result == -1) {
//                     proxy.$message({
//                         message: '已经签到，无需重复签到',
//                         type: 'warning',
//                         duration: 1200
//                     });
//                 } else if (result == 1) {
//                     //在弹窗中显示身份证信息
//                     checkinDialog.dataForm.name = name;
//                     checkinDialog.dataForm.sex = sex;
//                     checkinDialog.dataForm.pid = pid;
//                     checkinDialog.dataForm.photo_1 = image;
//                     //获取浏览器是否连接了摄像头
//                     let bool = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//                     if (bool) {
//                         //获取数据流
//                         navigator.getUserMedia(
//                             { audio: false, video: true },
//                             function (stream) {
//                                 //根据ID查找视图层中的video控件
//                                 let video = document.querySelector('#video');
//                                 //给视图层video控件设置数据流
//                                 video.srcObject = stream;
//                                 //把视频流保存到模型层，将来关闭弹窗的时候可以切断视频流
//                                 checkinDialog.streamTrack = stream.getTracks()[0];

//                                 //给视图层video控件成功加载视频流
//                                 video.onloadedmetadata = function (e) {
//                                     video.play(); //播放视频流内容
//                                     checkinDialog.showEmpty = false;
//                                     checkinDialog.showPhoto = false;
//                                     checkinDialog.showVedio = true;
//                                 };
//                             },
//                             function (err) {
//                                 proxy.$message({
//                                     message: '开启摄像头失败',
//                                     type: 'error',
//                                     duration: 1200
//                                 });
//                             }
//                         );
//                     } else {
//                         proxy.$message({
//                             message: '当前电脑没有连接摄像头',
//                             type: 'error',
//                             duration: 1200
//                         });
//                     }
//                 } else {
//                     proxy.$message({
//                         message: '该体检人未预约',
//                         type: 'error',
//                         duration: 1200
//                     });
//                 }
//             });

//         }
//     } else {
//         console.log('websocket 协议调用失败，原因：' + jsonObject.ErrInfo);
//     }
// };

const _openCamera = () => {
    let json = {
        name: '朴一',
        sex: '男',
        pid: '222401198907072510'
    }
    proxy.$http('/mis/appointment/hasAppointInToday', 'POST', json, true, function (resp) {
        let result = resp.result;
        if (result == -1) {
            proxy.$message({
                message: 'すでに受付済みのため、再度受付する必要はありません。',
                type: 'warning',
                duration: 1200
            });
        } else if (result == 1) {
            //在弹窗中显示身份证信息
            checkinDialog.dataForm.name = json.name;
            checkinDialog.dataForm.sex = json.sex;
            checkinDialog.dataForm.pid = json.pid;
            checkinDialog.dataForm.photo_1 = imageBase64;
            //获取浏览器是否连接了摄像头
            let bool = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (bool) {
                //获取数据流
                navigator.getUserMedia(
                    { audio: false, video: true },
                    function (stream) {
                        //根据ID查找视图层中的video控件
                        let video = document.querySelector('#video');
                        //给视图层video控件设置数据流
                        video.srcObject = stream;
                        //把视频流保存到模型层，将来关闭弹窗的时候可以切断视频流
                        checkinDialog.streamTrack = stream.getTracks()[0];

                        //给视图层video控件成功加载视频流
                        video.onloadedmetadata = function (e) {
                            video.play(); //播放视频流内容
                            checkinDialog.showEmpty = false;
                            checkinDialog.showPhoto = false;
                            checkinDialog.showVideo = true;
                        };
                    },
                    function (err) {
                        proxy.$message({
                            message: 'カメラの起動に失敗しました。',
                            type: 'error',
                            duration: 1200
                        });
                    }
                );
            } else {
                proxy.$message({
                    message: '現在、このパソコンにはカメラが接続されていません。',
                    type: 'error',
                    duration: 1200
                });
            }
        } else {
            proxy.$message({
                message: 'この健康診断受診者は予約されていません。',
                type: 'error',
                duration: 1200
            });
        }
    });
}

function takePhotoHandle() {
    if (checkinDialog.btnText == '撮影') {
        let video = document.querySelector('#video');
        let canvas = document.querySelector('#photo');

        let context = canvas.getContext('2d');
        //把摄像头当前的取景内容绘制到canvas控件中
        context.drawImage(video, 0, 0, 460, 345);

        //显示canvas控件，隐藏两个排他控件
        checkinDialog.showEmpty = false;
        checkinDialog.showVideo = false;
        checkinDialog.showPhoto = true;

        proxy.$message({
            message: '撮影に成功しました。',
            type: 'success',
            duration: 1200
        });
        //更新按钮文字和图标
        checkinDialog.btnText = '再撮影';
        checkinDialog.btnIcon = RefreshRight;
        //把canvas中的图片转换成base64编码
        checkinDialog.dataForm.photo_2 = canvas.toDataURL('image/jpeg');
    } else {
        //隐藏canvase，显示摄像头取景
        checkinDialog.showEmpty = false;
        checkinDialog.showVideo = true;
        checkinDialog.showPhoto = false;
        //更新按钮文字和图标
        checkinDialog.btnText = '撮影';
        checkinDialog.btnIcon = Camera;
    }
}

function closeHandle() {
    if (checkinDialog.streamTrack != null) {
        checkinDialog.streamTrack.stop();
    }
    checkinDialog.showEmpty = true;
    checkinDialog.showVideo = false;
    checkinDialog.showPhoto = false;
    checkinDialog.visible = false;
    checkinDialog.btnText = '撮影';
    checkinDialog.btnIcon = Camera;
}

function dataFormSubmit() {
    let json = {
        pid: checkinDialog.dataForm.pid,
        name: checkinDialog.dataForm.name,
        photo_1: checkinDialog.dataForm.photo_1,
        photo_2: checkinDialog.dataForm.photo_2
    };
    proxy.$http('/mis/appointment/checkin', 'POST', json, true, function (resp) {
        if (resp.result) {
            ElNotification({
                title: 'お知らせ',
                message: "チェックイン成功",
                type: 'success',
                duration: 1200
            });
            checkinDialog.showEmpty = true;
            checkinDialog.showVideo = false;
            checkinDialog.showPhoto = false;
            checkinDialog.btnIcon = Camera;
            checkinDialog.btnText = '撮影';
            checkinDialog.dataForm.name = null;
            checkinDialog.dataForm.sex = null;
            checkinDialog.dataForm.pid = null;
            checkinDialog.dataForm.photo_1 = null;
            checkinDialog.dataForm.photo_2 = null;
            loadDataList();
        } else {
            proxy.$message({
                message: "チェックイン失敗",
                type: 'error',
                duration: 1200
            });
        }
    });
}

const guidanceDialog = reactive({
    visible: false,
    name: null,
    sex: null,
    age: null,
    pid: null,
    tel: null,
    date: null,
    company: null,
    qrCodeBase64: null,
    checkup: []
});

function guidanceHandle(id) {
    guidanceDialog.visible = true
    proxy.$http("/mis/appointment/searchGuidanceInfo", "POST", { id: id }, true, function (resp) {
        let result = resp.result
        guidanceDialog.name = result.name
        guidanceDialog.sex = result.sex
        guidanceDialog.age = result.age
        guidanceDialog.pid = result.pid
        guidanceDialog.tel = result.tel
        guidanceDialog.date = result.date
        guidanceDialog.company = result.company == null ? '无' : result.company
        guidanceDialog.checkup = result.checkup
        guidanceDialog.qrCodeBase64 = result.qrCodeBase64
    })
}

function finishHandle() {
    ElMessageBox.prompt('健康診断番号を入力してこの健康診断を終了します。', '提示情報', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        inputPlaceholder: "健康診断番号",
        type: "warning",
        inputPattern: /^[0-9a-zA-Z]{32}$/,
        inputErrorMessage: '健康診断番号が正しくありません。',
    }).then(({ value }) => {
        let json = {
            uuid: value,
            status: 3
        }
        proxy.$http("/mis/appointment/updateStatusByUuid", "POST", json, true, function (resp) {
            if (resp.result) {
                proxy.$message({
                    message: '操作に成功しました。',
                    type: 'success',
                    duration: 1200,
                    onClose: () => {
                        loadDataList();
                    }
                });
            } else {
                proxy.$message({
                    message: '記録の更新に失敗しました。',
                    type: 'error',
                    duration: 1200
                });
            }
        })
    })
}
</script>

<style lang="less" scoped>
@import url('customer_checkin.less');
</style>