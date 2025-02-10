<template>
    <div v-if="proxy.isAuth(['ROOT', 'CHECKUP_REPORT:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="氏名" maxlength="20" class="input" clearable="clearable" />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="電話番号" maxlength="11" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="waybillCode">
                <el-input v-model="dataForm.waybillCode" placeholder="配送伝票番号" maxlength="24" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
            </el-form-item>
            <el-form-item>
                <el-upload :action="upload.action" name="file" accept=".xlsx" :headers="upload.headers"
                    :show-file-list="false" :before-upload="excelBeforeUpload" :on-success="excelUploadSuccess"
                    :on-error="excelUploadError">
                    <el-button type="primary">運送伝票をインポートする</el-button>
                </el-upload>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button label="すべて"></el-radio-button>
                    <el-radio-button label="未生成"></el-radio-button>
                    <el-radio-button label="生成済み"></el-radio-button>
                    <el-radio-button label="発送済み"></el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border
            v-loading="data.loading">
            <el-table-column type="index" header-align="center" align="center" width="120" label="番号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" label="氏名" min-width="150" fixed>
                <template #default="scope">
                    <span class="customer-name"
                        @dblclick="copyAddressHandle(scope.row.name, scope.row.tel, scope.row.mailingAddress)">{{
                            scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="sex" header-align="center" align="center" label="性别" width="130" />
            <el-table-column prop="age" header-align="center" align="center" label="年齢" width="130" />
            <el-table-column prop="hideTel" header-align="center" align="center" label="電話番号" width="180" />
            <el-table-column prop="status" header-align="center" align="center" label="報告の状態" width="140" />
            <el-table-column prop="waybillCode" header-align="center" align="center" label="配送伝票番号" width="280" />
            <el-table-column prop="waybillDate" header-align="center" align="center" label="発送日" width="170" />
            <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
                <template #default="scope">
                    <el-button type="text" :disabled="scope.row.disabled" @click="createReportHandle(scope.row.id)">
                        報告書を生成する
                    </el-button>
                    <el-button type="text" :disabled="scope.row.status == '未生成'"
                        @click="downloadReportHandle(scope.row.name, scope.row.filePath)">
                        報告書をダウンロードする
                    </el-button>
                    <el-button type="text" :disabled="scope.row.status != '生成済み'"
                        @click="identifyWaybillHandle(scope.row.id, scope.row.name, scope.row.tel)">
                        運送伝票を入力する
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <el-dialog title="運送伝票を入力する" v-if="proxy.isAuth(['ROOT', 'CHECKUP_REPORT:UPDATE'])" :close-on-click-modal="false"
        v-model="dialog.visible" width="420px">
        <el-alert title="配送伝票の写真をアップロードしてください。システムが自動的に伝票の情報を認識し、その後、内容に誤りがないかご確認いただき、運送伝票の情報を提出してください。" type="success" :closable="false" />
        <el-upload :action="dialog.upload.action" name="file" accept=".jpg,.jpeg" :headers="dialog.upload.headers"
            :show-file-list="false" :before-upload="waybillBeforeUpload" :on-success="waybillUploadSuccess"
            :on-error="waybillUploadError">
            <el-button type="primary">運送伝票をアップロードする</el-button>
        </el-upload>
        <el-divider border-style="dashed">下記の運送伝票情報をよく確認してください</el-divider>
        <table class="waybill-table">
            <tr>
                <th>受取人氏名：</th>
                <td>{{ dialog.data.recName }}</td>
            </tr>
            <tr>
                <th>受取人電話：</th>
                <td>{{ dialog.data.recTel }}</td>
            </tr>
            <tr>
                <th>運送伝票番号：</th>
                <td>{{ dialog.data.waybillCode }}</td>
            </tr>
        </table>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">中止する</el-button>
                <el-button type="primary"
                    :disabled="dialog.data.waybillCode == null || dialog.data.name != dialog.data.recName || dialog.data.recTel.substr(7, 4) != dialog.data.telEnd"
                    @click="dataFormSubmit">
                    運送伝票を提出する
                </el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { reactive, getCurrentInstance, ref } from 'vue';
import { ElNotification, type UploadFile, type UploadFiles } from 'element-plus'
import { isBlank } from '../../utils/validate';

import { dayjs } from 'element-plus'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrBefore)

const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    name: null,
    tel: null,
    waybillCode: null,
    statusLabel: 'すべて',
    status: null
});

const data = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

const dataRule = reactive({
    name: [
        { required: false, pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '氏名の形式が誤っています' }
    ],
    tel: [
        { required: false, pattern: '^1[1-9]\\d{9}$', message: '電話番号の形式が誤っています' }
    ],
    waybillCode: [
        { required: false, pattern: '^[0-9a-zA-Z]{10,24}$', message: '配送伝票番号の形式が間違っています' }
    ]
});

const upload = reactive({
    action: `${proxy.$baseUrl}/mis/checkup/report/importWaybills`,
    headers: {
        "token": localStorage.getItem('token')
    },
});

const dialog = reactive({
    visible: false,
    upload: {
        action: `${proxy.$baseUrl}/mis/checkup/report/identifyWaybill`,
        headers: {
            "token": localStorage.getItem('token')
        },
        data: {
            id: null
        }
    },
    data: {
        id: null,
        recName: null,
        recTel: null,
        waybillCode: null,
        name: null,
        telEnd: null
    }
})

function loadDataList() {
    data.loading = true;
    if (dataForm.statusLabel == '全部') {
        dataForm.status = null;
    } else if (dataForm.statusLabel == '未生成') {
        dataForm.status = 1;
    } else if (dataForm.statusLabel == '已生成') {
        dataForm.status = 2;
    } else {
        dataForm.status = 3;
    }
    let json = {
        name: dataForm.name,
        tel: dataForm.tel,
        waybillCode: dataForm.waybillCode,
        status: dataForm.status,
        page: data.pageIndex,
        length: data.pageSize
    };

    proxy.$http('/mis/checkup/report/searchByPage', 'POST', json, true, function (resp: any) {
        let page = resp.page;
        let temp = {
            "1": "未生成",
            "2": "生成済み",
            "3": "発送済み"
        }
        for (let one of page.list) {
            one.status = temp[one.status + ""]
            /*
            * 生成报告按钮是否禁用。
            * 当前日期时间十天之前如果在体检日之前，说明体检距今未超过10天，生成报告按钮处于禁用状态
            */
            // one.disabled = dayjs().subtract(10, 'day').isSameOrBefore(dayjs(one.date)) || one.status != '未生成'
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
            if (dataForm.waybillCode == '') {
                dataForm.waybillCode = null;
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

function createReportHandle(id) {
    ElNotification({
        title: '提示情報',
        message: '健康診断報告書は現在生成中です。しばらくお待ちください。',
        duration: 1000
    })

    let json = { id: id }
    proxy.$http("/mis/checkup/report/createReport", "POST", json, true, function (resp) {
        if (resp.result) {
            proxy.$message({
                message: '健康診断報告書の作成が成功しました',
                type: 'success',
                duration: 1200,
                onClose: () => {
                    loadDataList();
                }
            });
        }
        else {
            proxy.$message({
                message: '健康診断報告書の作成に失敗しました',
                type: 'error',
                duration: 1200
            });
        }
    })
}

function downloadReportHandle(name, filePath) {
    let url = `${proxy.$baseUrl}/mis/checkup/report/downloadReport?token=${localStorage.getItem('token')}&name=${name}&filePath=${filePath}`;
    let a = document.createElement('a');
    a.href = url;
    a.click();
}

function copyAddressHandle(name, tel, mailingAddress) {
    proxy.$message({
        message: "郵送先住所がコピーされました",
        type: 'success',
        duration: 800
    });
    var input = document.createElement("input");   // 直接构建input
    input.value = `${name},${tel},${mailingAddress}`;  // 设置内容
    document.body.appendChild(input);    // 添加临时实例
    input.select();   // 选择实例内容
    document.execCommand("Copy");   // 执行复制
    document.body.removeChild(input); // 删除临时实例
}

function identifyWaybillHandle(id, name, tel) {
    dialog.data.id = id;
    dialog.data.recName = null
    dialog.data.recTel = null
    dialog.data.waybillCode = null
    dialog.data.name = name
    dialog.data.telEnd = tel.substr(7, 4) //保存尾号
    dialog.visible = true
}

function waybillBeforeUpload(file) {
    let size = file.size / 1024 / 1024;
    if (size > 5) {
        proxy.$message({
            message: '画像は5MBを超えてはいけません',
            type: 'error',
            duration: 1200
        });
        return false;
    }
    proxy.$message({
        message: '認識中です。しばらくお待ちください。',
        type: 'info',
        duration: 1000
    });
    return true;
}

function waybillUploadError(e) {
    proxy.$message({
        message: "画像のアップロードに失敗しました",
        type: 'error',
        duration: 1200
    });
    console.error(e)
}

function waybillUploadSuccess(resp : any, uploadFile : UploadFile, uploadFiles : UploadFiles) {
    if (resp.msg == 'success') {
        let result = resp.result;
        dialog.data.recName = result.recName
        dialog.data.recTel = result.recTel
        dialog.data.waybillCode = result.waybillCode
        if (result.recName != dialog.data.name || result.recTel.substr(7, 4) != dialog.data.telEnd) {
            proxy.$message({
                message: '受取人の氏名または電話番号が体検者と一致しません',
                type: 'error',
                duration: 1200
            });
        }
    }
}

function dataFormSubmit() {
    let waybillCode = dialog.data.waybillCode
    let waybillDate = dayjs().format('YYYY-MM-DD')
    if (!isBlank(waybillCode)) {
        let json = {
            id: dialog.data.id,
            waybillCode: waybillCode,
            waybillDate: waybillDate
        }
        proxy.$http("/mis/checkup/report/addWaybill", "POST", json, true, function (resp) {
            if (resp.result) {
                proxy.$message({
                    message: "運送伝票の提出が成功しました",
                    type: 'success',
                    duration: 1200,
                    onClose: () => {
                        dialog.visible = false
                        loadDataList()
                    }
                });
            }
            else {
                proxy.$message({
                    message: "運送伝票の提出に失敗しました",
                    type: 'error',
                    duration: 1200
                });
            }
        })
    }
}

function base64ToBlob(base64, mime) {
    let arr = base64.split(",")
    let bstr = atob(arr)
    let n = bstr.length
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime
    });
}

function excelBeforeUpload(file) {
    let size = file.size / 1024 / 1024;
    if (size > 20) {
        proxy.$message({
            message: 'Excelファイルのサイズは20MBを超えてはいけません',
            type: 'error',
            duration: 1200
        });
        return false;
    }
    return true;
}

function excelUploadSuccess(resp : any, uploadFile : UploadFile, uploadFiles : UploadFiles) {
    loadDataList()
    if (resp.hasOwnProperty("fileBase64")) {
        proxy.$message({
            message: 'インポートに失敗した運送伝票があります。ダウンロードしたExcelファイルをご確認ください。',
            type: 'warning',
            duration: 2500
        });
        let base64 = resp.fileBase64;
        //把base64字符串转换成Blob二进制数据，并且设置MIME类型
        let blob = base64ToBlob(base64, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        let a = document.createElement("a")
        //把二进制数据转换成URL地址
        let href = window.URL.createObjectURL(blob)
        a.href = href
        //规定下载文件名称
        a.download = "インポートに失敗した運送伝票.xlsx"
        document.body.appendChild(a)
        //访问二进制数据，然后浏览器自动会下载Excel文件
        a.click()
        document.body.removeChild(a)
        //释放二进制数据，节省浏览器内存
        window.URL.revokeObjectURL(href)
    }
    else {
        proxy.$message({
            message: '運送伝票のインポートが成功しました',
            type: 'success',
            duration: 1200
        });
    }
}

function excelUploadError(e) {
    proxy.$message({
        message: "Excelファイルのアップロードに失敗しました",
        type: 'error',
        duration: 1200
    });
    console.error(e)
}

</script>

<style lang="less" scoped>
@import url('checkup_report.less');
</style>
