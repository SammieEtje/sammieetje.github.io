// 016 fix: the local-path pattern without dependencies, so jobs that install no packages can use it
// (014:FR-005, 016:FR-008)
export const LOCAL_PATH = /\/Users\/|\/home\/|[A-Za-z]:\\\\/;
