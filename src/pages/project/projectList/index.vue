<template>
  <div class="tianditu-search-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="请输入搜索关键词（如：故宫、星巴克）"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch" class="search-btn">搜索</button>
    </div>


    <!-- 地图容器 -->
    <div ref="mapRef" class="map-container"></div>

    <!-- 搜索结果面板 -->
    <div class="result-panel">
      <div v-if="loading" class="loading">搜索中...</div>
      <div v-else-if="searchResults.length === 0 && hasSearched" class="no-result">未找到相关结果</div>
      <div v-else-if="searchResults.length > 0">
        <h3>搜索结果（共{{ searchResults.length }}条）</h3>
        <div v-for="(poi, index) in searchResults" :key="index" class="poi-item" @click="locateToPoi(poi.lng, poi.lat)">
          <p><strong>名称：</strong>{{ poi.name || '无' }}</p>
          <p><strong>地址：</strong>{{ poi.address || '无' }}</p>
          <p><strong>坐标：</strong>经度{{ poi.lonlat[0] }}，纬度{{ poi.lonlat[1] }}</p>
        </div>
      </div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import pngLocalRed1 from '@/assets/local_1_red.png'
import {ExactGcj02Converter } from '@/utils/location';

// 响应式数据
const searchKeyword = ref(''); // 搜索关键词
const searchResults = ref([]); // 搜索结果列表
const loading = ref(false); // 加载状态
const hasSearched = ref(false); // 是否执行过搜索
const mapRef = ref(null); // 地图容器DOM引用
const errorMsg = ref(''); // 错误提示
const currentLocation = ref(null); // 当前位置信息
const locationLoading = ref(false); // 定位加载状态

// 非响应式变量（地图/搜索实例）
let map = null;
let localSearch = null;

// 初始化地图和搜索实例
const initMap = () => {
  if (!mapRef.value || !window.T) {
    errorMsg.value = '地图容器未挂载或天地图API未加载';
    console.error(errorMsg.value);
    return;
  }

  // 1. 初始化地图
  map = new window.T.Map(mapRef.value);
  // 设置默认中心点（北京）和缩放级别
  const defaultCenter = new window.T.LngLat(116.403874, 39.914885);
  map.centerAndZoom(defaultCenter, 12);
  // 开启交互功能
  map.enableDrag();
  map.enableScrollWheelZoom();

  // 2. 初始化LocalSearch（适配v4.0 API）
  localSearch = new window.T.LocalSearch(map, {
    pageCapacity: 10, // 每页结果数
    autoViewport: true, // 自动调整地图视野
    // 搜索完成回调（v4.0 直接返回JSON数据）
    onSearchComplete: (results) => {
      loading.value = false;
      hasSearched.value = true;
      errorMsg.value = '';
      searchResults.value = [];

      // 第一步：打印results，便于调试（可后续删除）
      console.log('天地图返回的原始数据：', results.pois);

      // 情况2：无匹配结果
      if (!results.pois || results.pois.length === 0) {
        return;
      }

      // 情况3：有有效结果（解析JSON数组）
      searchResults.value = results.pois.map((poi) => {
        const [gcjLat, gcjLng] = ExactGcj02Converter.cgcs2000ToGcj02Exact(Number(poi.lonlat.split(',')[1]), Number(poi.lonlat.split(',')[0]));
        return {
          name: poi.name,
          address: poi.address,
          lng: poi.lonlat.split(',')[0],
          lat: poi.lonlat.split(',')[1],
          lonlat: [gcjLng, gcjLat],
          tel: poi.phone || '',
          type: poi.poiType || '',
        };
      });
      console.log('处理后的结果：', searchResults.value);
    },
  });
};

// 获取当前地理位置
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    errorMsg.value = '浏览器不支持地理位置定位';
    return;
  }

  locationLoading.value = true;
  errorMsg.value = '';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationLoading.value = false;
      const { longitude, latitude } = position.coords;
      // 更新当前位置信息
      currentLocation.value = {
        lng: longitude,
        lat: latitude,
      };
      // 在地图上标记当前位置
      markCurrentLocation(longitude, latitude);
    },
    (error) => {
      locationLoading.value = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg.value = '用户拒绝了地理位置请求';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg.value = '位置信息不可用';
          break;
        case error.TIMEOUT:
          errorMsg.value = '获取位置超时';
          break;
        default:
          errorMsg.value = '获取位置失败: ' + error.message;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5分钟内的缓存位置有效
    }
  );
};

// 在地图上标记当前位置
const markCurrentLocation = (lng, lat) => {
  if (!map) return;

  // 清除之前的当前位置标记
  if (window.currentLocationMarker) {
    map.removeOverLay(window.currentLocationMarker);
  }

  // 中心点定位到当前位置
  const point = new window.T.LngLat(lng, lat);
  map.panTo(point);

  // 添加自定义标记
  window.currentLocationMarker = new window.T.Marker(point, {
    icon: new window.T.Icon({
      iconUrl: pngLocalRed1,
      iconSize: new window.T.Point(30, 34),
      iconAnchor: new window.T.Point(15, 34),
    })
  });
  map.addOverLay(window.currentLocationMarker);
  // window.currentLocationMarker.setTitle('当前位置');
};

// 执行搜索
const handleSearch = () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    return;
  }

  loading.value = true;
  errorMsg.value = '';
  // 清空之前的结果（地图标注+列表）
  if (localSearch) {
    localSearch.clearResults();
  }
  // 执行搜索
  localSearch.search(keyword);
};

// 定位到指定POI
const locateToPoi = (lng, lat) => {
  if (!map) return;
  const point = new window.T.LngLat(lng, lat);
  // 地图平移到目标点
  map.panTo(point);
  // 添加自定义标注（可选）
  const marker = new window.T.Marker(point);
  console.log(marker)
  map.addOverLay(marker);
  marker.setTitle('选中位置');
};

// 生命周期：挂载后初始化地图
onMounted(() => {
  initMap();
  getCurrentLocation();
});

// 生命周期：卸载前销毁实例（避免内存泄漏）
onUnmounted(() => {
  if (localSearch) {
    localSearch.clearResults();
  }
  if (map) {
    map = null;
    localSearch = null;
  }
});
</script>
<style scoped>
.tianditu-search-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  outline: none;
}

.search-btn {
  height: 38px;
  width: 80px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.search-btn:hover {
  background: #0f62d9;
}

.current-location {
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 14px;
  color: #1890ff;
}

.map-container {
  width: 100%;
  height: 600px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 20px;
}

.result-panel {
  position: absolute;
  left: 40px;
  top: 98px;
  /* 搜索栏高度 + 上下边距 */
  width: 280px;
  max-height: 580px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 9999;
}

.loading {
  color: #666;
  line-height: 100px;
  text-align: center;
}

.no-result {
  color: #999;
  line-height: 100px;
  text-align: center;
}

.error {
  color: #f5222d;
  line-height: 100px;
  text-align: center;
}

.poi-item {
  margin: 8px 0;
  padding: 8px;
  background: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
}

.poi-item:hover {
  background: #f0f0f0;
}
</style>
