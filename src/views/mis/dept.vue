<template>
  <div v-if="proxy.isAuth(['ROOT', 'DEPT:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="deptName">
        <el-input v-model="dataForm.deptName" placeholder="部門名" maxlength="10" class="input" clearable="clearable" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">検索</el-button>
        <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'DEPT:INSERT'])" @click="addHandle()">
          追加
        </el-button>
        <el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'DEPT:DELETE'])" @click="deleteHandle()">
          一括削除
        </el-button>
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
      <el-table-column prop="deptName" header-align="center" align="center" label="部門名" min-width="170" fixed />
      <el-table-column prop="tel" header-align="center" align="center" label="電話番号" width="170" />
      <el-table-column prop="email" header-align="center" align="center" label="メールアドレス" width="270" />
      <el-table-column header-align="center" align="center" label="従業員数" width="140">
        <template #default="scope">
          <span>{{ scope.row.emps }}人</span>
        </template>
      </el-table-column>
      <el-table-column prop="desc" header-align="center" align="center" label="備考" min-width="350" />
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template #default="scope">
          <el-button type="text" :disabled="!proxy.isAuth(['ROOT', 'DEPT:UPDATE'])" @click="updateHandle(scope.row.id)">
            編集
          </el-button>
          <el-button type="text" :disabled="!proxy.isAuth(['ROOT', 'DEPT:DELETE']) || scope.row.emps > 0"
            @click="deleteHandle(scope.row.id)">
            削除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="data.pageIndex"
      :page-sizes="[10, 20, 50]" :page-size="data.pageSize" :total="data.totalCount"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
  <el-dialog :title="!dialog.dataForm.id ? '追加' : '編集'" v-if="proxy.isAuth(['ROOT', 'DEPT:INSERT', 'DEPT:UPDATE'])"
    :close-on-click-modal="false" v-model="dialog.visible" width="360px">
    <el-form :model="dialog.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="90px">
      <el-form-item label="部門" prop="deptName">
        <el-input v-model="dialog.dataForm.deptName" maxlength="10" clearable />
      </el-form-item>
      <el-form-item label="電話番号" prop="tel">
        <el-input v-model="dialog.dataForm.tel" maxlength="11" clearable />
      </el-form-item>
      <el-form-item label="メール" prop="email">
        <el-input v-model="dialog.dataForm.email" maxlength="200" clearable />
      </el-form-item>
      <el-form-item label="備考" prop="desc">
        <el-input v-model="dialog.dataForm.desc" maxlength="20" clearable />
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
const proxy: any = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
  deptName: null
});

const dataRule = reactive({
  deptName: [{ required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '部門名の形式が誤っています' }]
});

const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
  selections: []
});

const dialog = reactive({
  visible: false,
  dataForm: {
    id: null,
    deptName: null,
    tel: null,
    email: null,
    desc: null
  },
  dataRule: {
    deptName: [{ required: true, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,10}$', message: '部门名称格式错误' }],
    tel: [
      {
        required: false,
        pattern: '^1[1-9]\\d{9}$|^(0\\d{2,3}\-){0,1}[1-9]\\d{6,7}$',
        message: '電話番号の形式が誤っています'
      }
    ],
    email: [
      {
        required: false,
        pattern: '^([a-zA-Z]|[0-9])(\\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$',
        message: 'メールアドレスの形式が誤っています'
      }
    ]
  }
});

function loadDataList() {
  data.loading = true;
  let json = {
    deptName: dataForm.deptName,
    page: data.pageIndex,
    length: data.pageSize
  };

  proxy.$http('/mis/dept/searchByPage', 'POST', json, true, function (resp: any) {
    let page = resp.page;
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
      if (dataForm.deptName == '') {
        dataForm.deptName = null;
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

function addHandle() {
    dialog.dataForm.id = null;
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
    });
}

function dataFormSubmit() {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            proxy.$http(
                `/mis/dept/${dialog.dataForm.id == null ? 'insert' : 'update'}`,
                'POST',
                dialog.dataForm,
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
                            }
                        });

                    } else {
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
        proxy.$http('/mis/dept/searchById', 'POST', json, true, function (resp) {
            let result = resp.result;
            dialog.dataForm.deptName = result.deptName;
            dialog.dataForm.tel = result.tel;
            dialog.dataForm.email = result.email;
            dialog.dataForm.desc = result.desc;
        });
    });
}

function selectable(row, index) {
    if (row.emps > 0) {
        return false;
    }
    return true;
}

function selectionChangeHandle(val) {
    data.selections = val;
}

function deleteHandle(id) {
    let ids = id
        ? [id]
        : data.selections.map(item => {
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
            proxy.$http('/mis/dept/deleteByIds', 'POST', json, true, function (resp) {
                if (resp.rows > 0) {
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
                        message: '記録を削除できませんでした',
                        type: 'warning',
                        duration: 1200
                    });
                }
            });
        });
    }
}

</script>

<style scoped></style>