function copyMapResouces(mapResouces) {
  let newMapResouces = new Map(mapResouces);
  for (let [key, value] of newMapResouces) {
    newMapResouces.set(key, value.copy());
  }
  return newMapResouces;
}

export { copyMapResouces };
