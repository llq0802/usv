// 'a,b' <=> [b, a]
export const turnLngLat = o => {
  if (Object.prototype.toString.call(o) === '[object String]') {
    let strs = o.split(',');
    return [Number(strs[1]), Number(strs[0])];
  } else if (Object.prototype.toString.call(o) === '[object Array]') {
    return `${o[1]},${o[0]}`;
  }
}

// 'a,b' | [b, a] => {latitude: a, longitude: b}
export const turnLngLatObj = o => {
  if (Object.prototype.toString.call(o) === '[object String]') {
    let strs = o.split(',');
    return {
      latitude: parseFloat(strs[0]),
      longitude: parseFloat(strs[1])
    }
  } else if (Object.prototype.toString.call(o) === '[object Array]') {
    return {
      latitude: o[1],
      longitude: o[0]
    }
  }
}

// [[a, b], [c, d]] => [{latitude: b, longitude: a}, {latitude: d, longitude: c}]
export const tdArrToObjArr = arr => {
  let location = [];
  let locationObject;
  if (arr) {
    arr.forEach((element, index) => {
      locationObject = {
        latitude: element[1],
        longitude: element[0]
      };
      location.push(locationObject);
    });
  }
  return location;
}

// [{latitude: b, longitude: a}, {latitude: d, longitude: c}] => [[a, b], [c, d]]
export const objArrToTdArr = arr => {
  let location = [];
  let locationArray;
  if (arr) {
    arr.forEach((element, index) => {
      locationArray = [element.longitude, element.latitude];
      location.push(locationArray);
    });
  }
  return location;
}

// ['a, b', 'c, b'] => [[a, b], [c, d]]
export const strArrToTdArr = arr => {
  let location = [];
  let locationArray;
  if (arr) {
    arr.forEach((element, index) => {
      locationArray = element.split(',');
      location.push(locationArray);
    });
  }
  return location;
}

// [a, b], [c, d] => [[a, b], [c, d]]
export const arrToTdArr = arr => {
  
};

// 字符串转换路径坐标 '1,2 /n 3,4' => [[2,1],[4,3]]
export const translatePath = string => {
  let pointList = [];
  // ['1,2 3,4']
  if (Object.prototype.toString.call(string) === '[object Array]') {
    string = string.toString();
  }
  // ['1,2', '3,4']
  pointList = string.split('/n')[0].split(' ');
  let newPointList = [];
  pointList.forEach(point => {
    let arr = point.split(',');
    newPointList.push([Number(arr[1]), Number(arr[0])])
  })
  return newPointList;
}