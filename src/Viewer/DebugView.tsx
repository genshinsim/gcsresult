import { DebugItemView } from "./DebugItemView";
import { DebugRow, parseLog } from "./parse";
import InfiniteScroll from "react-infinite-scroll-component";
import React from "react";

export function Debugger({
  data,
  team
}: {
  data: DebugRow[]
  team: string[]
}) {
  const [rowsLoaded, setRowsLoaded] = React.useState<number>(50);

  const maxCount = data.length;

  console.log("max: ", maxCount);
  console.log("loaded: ", rowsLoaded);

  const handleLoadMore = () => {
    console.log("loading more");
    if (rowsLoaded < maxCount) {
      let next = rowsLoaded + 20;
      if (next > maxCount) {
        next = maxCount;
      }
      setRowsLoaded(next);
    }
  };

  const char = team.map((c) => {
    return (
      <div className="capitalize text-lg font-medium text-gray-100 border-l-2 border-b-2 border-gray-500">
        {c}
      </div>
    );
  });

  const rows : JSX.Element[] = []

  for (let i = 0; i < rowsLoaded; i++) {
    const row = data[i]
    let count = 0;
    const cols = row.slots.map((slot, ci) => {
      const events = slot.map((e, ei) => {
        count++;
        return <DebugItemView item={e} key={ei} />;
      });

      return (
        <div
          key={ci}
          className={
            row.active == ci
              ? "border-l-2 border-gray-500 bg-gray-400	"
              : "border-l-2 border-gray-500"
          }
        >
          {events}
        </div>
      );
    });

    if (count === 0) {
      continue
    }

    //map out each col
    rows.push(
      <div className="flex flex-row" key={row.key}>
        <div
          className="text-right text-gray-100 border-b-2 border-gray-500"
          style={{ minWidth: "100px" }}
        >
          <div>{`${row.f} | ${(row.f / 60).toFixed(2)}s`}</div>
        </div>
        <div className="grid grid-cols-5 flex-grow border-b-2 border-gray-500">
          {cols}
        </div>
        <div style={{ width: "20px", minWidth: "20px" }} />
      </div>
    );
  }

  return (
    <div className="m-2 p-2 rounded-md bg-gray-600 text-xs">
      <div className="flex flex-row debug-header">
        <div
          className="font-medium text-lg text-gray-100 border-b-2 border-gray-500 text-right"
          style={{ minWidth: "100px" }}
        >
          F | Sec
        </div>
        <div className="grid grid-cols-5 flex-grow">
          <div className="font-medium text-lg text-gray-100 border-l-2 border-b-2 border-gray-500">
            Sim
          </div>
          {char}
        </div>
        <div style={{ width: "20px", minWidth: "20px" }} />
      </div>
      <div className="flex flex-col">
        <InfiniteScroll
          dataLength={rowsLoaded} //This is important field to render the next data
          next={handleLoadMore}
          hasMore={rowsLoaded < maxCount}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
          scrollableTarget="scroll-target"
          scrollThreshold={0.5}
        >
          {rows}
        </InfiniteScroll>
      </div>
    </div>
  );
}
