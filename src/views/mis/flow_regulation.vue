<template>
    <div v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item>
                <el-select v-model="dataForm.place" placeholder="診療科名" clearable="clearable">
                    <el-option v-for="one in data.placeList" :label="one" :value="one" />
                </el-select>
            </el-form-item>
            <el-form-item prop="blueUuid">
                <el-input v-model="dataForm.blueUuid" placeholder="BluetoothビーコンUUID" maxlength="32" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
                <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'FLOW_REGULATION:INSERT'])"
                    @click="addHandle()">
                    追加
                </el-button>
                <el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'FLOW_REGULATION:DELETE'])"
                    @click="deleteHandle()">
                    一括削除
                </el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-switch v-model="dataForm.mode" size="large" active-text="自動流量調整" inactive-text="手動流量調整"
                    :before-change="changeModeHandle" />
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column type="index" header-align="center" align="center" width="100" label="序号">
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="place" header-align="center" align="center" min-width="250" label="診療科名" />
            <el-table-column prop="blueUuid" header-align="center" align="center" min-width="270" label="BluetoothビーコンUUID" />
            <el-table-column prop="realNum" header-align="center" align="center" min-width="120" label="実際の待機人数" />
            <el-table-column prop="maxNum" header-align="center" align="center" min-width="120" label="最大待機人数" />
            <el-table-column prop="weight" header-align="center" align="center" min-width="120" label="流量調整の重み" />
            <el-table-column prop="priority" header-align="center" align="center" min-width="120" label="流量調整の優先順位" />
            <el-table-column header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:UPDATE'])"
                        @click="updateHandle(scope.row.id)">
                        編集
                    </el-button>
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:DELETE'])"
                        @click="deleteHandle(scope.row.id)">
                        削除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <el-dialog :title="!dialog.dataForm.id ? '追加' : '編集'"
        v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:INSERT', 'FLOW_REGULATION:UPDATE'])" :close-on-click-modal="false"
        v-model="dialog.visible" width="450px">
        <el-form :model="dialog.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="150px">
            <el-form-item label="診療科名" prop="place">
                <el-input v-model="dialog.dataForm.place" placeholder="診療科名を入力してください。" maxlength="40" clearable />
            </el-form-item>
            <el-form-item label="Bluetoothビーコン" prop="blueUuid">
                <el-input v-model="dialog.dataForm.blueUuid" placeholder="Bluetoothビーコンを入力してください。" maxlength="32" clearable />
            </el-form-item>
            <el-form-item label="待機上限">
                <el-input-number v-model="dialog.dataForm.maxNum" min="1" max="500" :step="10" step-strictly />
            </el-form-item>
            <el-form-item label="流量制限の重み">
                <el-slider v-model="dialog.dataForm.weight" :step="1" show-stops :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="優先順位">
                <el-slider v-model="dialog.dataForm.priority" :step="1" show-stops :min="1" :max="10" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">中止する</el-button>
                <el-button type="primary" @click="dataFormSubmit">確認する</el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { reactive, getCurrentInstance, ref } from 'vue';
const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    place: null,
    blueUuid: null,
    mode: null
});

const data = reactive({
    placeList: [],
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

const dataRule = reactive({
    blueUuid: [
        { required: false, pattern: '^[a-zA-Z0-9]{32}$', message: 'Bluetoothビーコンを入力してください。' }
    ]
});

const dialog = reactive({
    visible: false,
    dataForm: {
        id: null,
        place: null,
        blueUuid: null,
        maxNum: 10,
        weight: 1,
        priority: 1
    },
    dataRule: {
        place: [
            { required: true, message: '診療科名を入力してください。' },
            { min: 2, message: '診療科名は2文字以上である必要があります。' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5\(\)]{2,40}$', message: '診療科名の形式が誤っています' }
        ],
        blueUuid: [
            { required: true, message: 'Bluetoothビーコンを入力してください。' },
            { pattern: '^[a-zA-Z0-9]{32}$', message: 'Bluetoothビーコンの形式が誤っています' }
        ]
    }
})

function loadPlaceList() {
    proxy.$http("/mis/flow_regulation/searchPlaceList", "GET", null, true, function (resp) {
        data.placeList = resp.result
    })
}
loadPlaceList();

function loadMode() {
    proxy.$http('/mis/flow_regulation/searchMode', 'GET', null, true, function (resp) {
        let result = resp.result
        dataForm.mode = result
    });
}
loadMode()

function loadDataList() {
    data.loading = true;
    let json = {
        page: data.pageIndex,
        length: data.pageSize,
        place: dataForm.place,
        blueUuid: dataForm.blueUuid
    };
    proxy.$http('/mis/flow_regulation/searchByPage', 'POST', json, true, function (resp) {
        let page = resp.page;
        let list = page.list;
        data.dataList = list;
        data.totalCount = page.totalCount;
        data.loading = false;
    });
}

loadDataList()

function searchHandle() {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.place == '') {
                dataForm.place = null;
            }
            if (dataForm.blueUuid == '') {
                dataForm.blueUuid = null;
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

function addHandle() {
    dialog.dataForm.id = null;
    dialog.dataForm.place = null;
    dialog.dataForm.blueUuid = null;
    dialog.dataForm.maxNum = 10;
    dialog.dataForm.weight = 1;
    dialog.dataForm.priority = 1;
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
    });
}

function dataFormSubmit() {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            let json = {
                id: dialog.dataForm.id,
                place: dialog.dataForm.place,
                blueUuid: dialog.dataForm.blueUuid,
                maxNum: dialog.dataForm.maxNum,
                weight: dialog.dataForm.weight,
                priority: dialog.dataForm.priority
            };
            proxy.$http(
                `/mis/flow_regulation/${dialog.dataForm.id == null ? 'insert' : 'update'}`,
                'POST',
                json,
                true,
                function (resp) {
                    if (resp.rows == 1) {
                        proxy.$message({
                            message: '操作に成功しました。',
                            type: 'success',
                            duration: 1200,
                            onClose: () => {
                                dialog.visible = false;
                                loadDataList();
                                loadPlaceList();
                            }
                        });
                    }
                    else {
                        proxy.$message({
                            message: '操作に失敗しました。',
                            type: 'error',
                            duration: 1200
                        });
                    }
                }
            );
        }
    });
}

function updateHandle(id) {
    dialog.dataForm.id = id;
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
        let json = { id: id };
        proxy.$http('/mis/flow_regulation/searchById', 'POST', json, true, function (resp) {
            let result = resp.result;
            dialog.dataForm.place = result.place;
            dialog.dataForm.blueUuid = result.blueUuid;
            dialog.dataForm.maxNum = result.maxNum;
            dialog.dataForm.weight = result.weight;
            dialog.dataForm.priority = result.priority;
        });
    });
}

function selectionChangeHandle(val) {
    data.selections = val;
}

function selectable(row, index) {
    return true;
}

function deleteHandle(id) {
    let ids = id ? [id] : data.selections.map(item => {
        return item.id;
    });
    if (ids.length == 0) {
        proxy.$message({
            message: '選択した記録がありません',
            type: 'warning',
            duration: 1200
        });
    } else {
        proxy.$confirm(`選択した記録を削除してもよろしいですか？`, '提示', {
            confirmButtonText: '確認する',
            cancelButtonText: '中止する',
            type: 'warning'
        }).then(() => {
            let json = { ids: ids };
            proxy.$http('/mis/flow_regulation/deleteByIds', 'POST', json, true, function (resp) {
                if (resp.rows > 0) {
                    proxy.$message({
                        message: '操作に成功しました。',
                        type: 'success',
                        duration: 1200,
                        onClose: () => {
                            loadDataList();
                            loadPlaceList();
                        }
                    });
                } else {
                    proxy.$message({
                        message: '記録を削除できませんでした',
                        type: 'warning',
                        duration: 1200
                    });
                }
            });
        });
    }
}

function changeModeHandle() {
    let json = { mode: !dataForm.mode };
    let flag = false;
    proxy.$http('/mis/flow_regulation/updateMode', 'POST', json, false, function (resp) {
        if (resp.result) {
            proxy.$message({
                message: '切り替え成功',
                type: 'success',
                duration: 800
            });
            flag = true
        } else {
            proxy.$message({
                message: '切り替え失敗',
                type: 'warning',
                duration: 800
            });
            flag = false
        }
    });
    return flag
}

</script>

<style lang="less" scoped>
.mold {
    float: right;
    margin-right: 0 !important;
}

.input {
    width: 250px !important;
}
</style>