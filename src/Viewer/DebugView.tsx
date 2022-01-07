import { DebugItemView } from "./DebugItemView";
import { parseLog } from "./parse";
import InfiniteScroll from "react-infinite-scroll-component";
import React from "react";

export function Debugger({
  log,
  active,
  team,
  selected,
}: {
  log: string;
  active: string;
  team: string[];
  selected: string[];
}) {
  const [rowsLoaded, setRowsLoaded] = React.useState<number>(50);

  const loaded = parseLog(active, team, log, selected);
  const maxCount = loaded.length;
  loaded.splice(rowsLoaded);

  console.log("max: ", maxCount);
  console.log("loaded: ", loaded.length);

  const handleLoadMore = () => {
    console.log("loading more");
    if (rowsLoaded < maxCount) {
      let next = rowsLoaded + 30;
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

  const rows = loaded.map((row) => {
    let count = 0;
    const cols = row.slots.map((slot, index) => {
      const events = slot.map((e, ei) => {
        count++;
        return <DebugItemView item={e} key={ei} />;
      });

      return (
        <div
          key={index}
          className={
            row.active == index
              ? "border-l-2 border-gray-500 bg-gray-400	"
              : "border-l-2 border-gray-500"
          }
        >
          {events}
        </div>
      );
    });

    if (count === 0) {
      return null;
    }

    //map out each col
    return (
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
  });

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
          dataLength={loaded.length} //This is important field to render the next data
          next={handleLoadMore}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
          scrollableTarget="scroll-target"
        >
          {rows}
        </InfiniteScroll>
      </div>
    </div>
  );
}
