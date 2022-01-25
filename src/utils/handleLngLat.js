// 字符串经纬度转成路径二维数组
export const str2Path = (str) => {
  const res = [];
  const tempArr = str.split(' ');
  for (const item of tempArr) {
    let bound = item.split(',').map(Number);
    res.push([bound[1], bound[0]]);
  }
  return res;
};
// 路径二维数组转成字符串经纬度
export function path2Str(arr) {
  let bounds = '';
  // bounds格式转换
  for (const item of arr) {
    if (item.lng) {
      bounds += `${item.lng},${item.lat} `;
    } else {
      bounds += `${item[1]},${item[0]} `;
    }
  }
  return bounds.trim();
}

// 'a,b' <=> [b, a]
export const turnLngLat = (o) => {
  const res = Object.prototype.toString.call(o).slice(8, -1);
  if (res === 'String') {
    let strs = o.split(',');
    return [+strs[1], +strs[0]];
  } else if (res === 'Array') {
    return `${o[1]},${o[0]}`;
  } else if (res === 'Object') {
    if (o.lng) {
      return `${o.lng},${o.lat}`;
    } else {
      return `${o.longitude},${o.latitude}`;
    }
  }
};

// 'a,b' | [b, a] => {latitude: a, longitude: b}
export const turnLngLatObj = (o) => {
  const res = Object.prototype.toString.call(o).slice(8, -1);
  if (res === 'String') {
    let strs = o.split(',');
    return {
      latitude: Number.parseFloat(strs[0]),
      longitude: Number.parseFloat(strs[1])
    };
  } else if (res === 'Array') {
    return {
      latitude: +o[1],
      longitude: +o[0]
    };
  }
};

// [[a, b], [c, d]] => [{latitude: b, longitude: a}, {latitude: d, longitude: c}]
export const tdArrToObjArr = (arr) => {
  let location = [];
  let locationObject;
  if (arr) {
    arr.forEach((element) => {
      locationObject = {
        latitude: +element[1],
        longitude: +element[0]
      };
      location.push(locationObject);
    });
  }
  return location;
};

// [{latitude: b, longitude: a}, {latitude: d, longitude: c}] => [[a, b], [c, d]]
export const objArrToTdArr = (arr) => {
  let location = [];
  let locationArray;
  if (arr) {
    arr.forEach((element) => {
      locationArray = [+element.longitude, +element.latitude];
      location.push(locationArray);
    });
  }
  return location;
};

// ['a, b', 'c, b'] => [[a, b], [c, d]]
export const strArrToTdArr = (arr) => {
  let location = [];
  let locationArray;
  if (arr) {
    arr.forEach((element) => {
      locationArray = element.split(',').map(Number);
      location.push(locationArray);
    });
  }
  return location;
};

// 字符串转换路径坐标 '1,2 /n 3,4' => [[2,1],[4,3]]
export const translatePath = (string) => {
  const res = Object.prototype.toString.call(o).slice(8, -1);
  let pointList = [];
  // ['1,2 3,4']
  if (res === 'Array') {
    string = string.toString();
  }
  // ['1,2', '3,4']
  pointList = string.split('/n')[0].split(' ');
  let newPointList = [];
  pointList.forEach((point) => {
    let arr = point.split(',');
    newPointList.push([Number(arr[1]), Number(arr[0])]);
  });
  return newPointList;
};
