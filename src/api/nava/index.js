import request from '../request';

//通过返回分页条件查询航标并返回
// {
//     Condition.Rect.TopLeft
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.TopRight
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.BottomLeft
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.Rect.BottomRight
//     pattern: ^[-]?\d+(\.\d+)?,[-]?\d+(\.\d+)?$
//     Condition.ZoomLevel
//     Condition.Keyword
//     Page
//     Size
// }
export const apiGetNavaByQuery = (params) => {
  return request({
    url: '/navaid​/search',
    method: 'get',
    params
  });
};
