import { DebugItemView } from "./DebugItemView";
import { DebugRow, parseLog } from "./parse";
import InfiniteScroll from "react-infinite-scroll-component";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import React from "react";

//every time i scroll x pixels, i want to add at least x pixels worth of items to be rendered and remove x pixels worth of items from the top
//every item that gets added should have a min pixel height
//we want to maintain at least container height + 100% worth items rendered

export function Debugger({ data, team, width, height }: { data: DebugRow[]; team: string[], width: number, height: number }) {
  const [rowsLoaded, setRowsLoaded] = React.useState<number>(50);

  //keep a reference to the rendered list
  const listRef = React.useRef<HTMLDivElement>(null);;

  const maxCount = data.length;

  console.log("max: ", maxCount);
  console.log("loaded 2: ", rowsLoaded);

  var targ = document.getElementById("scroll-target");
  console.log("scroll target: ", targ);
  if (targ) {
    console.log(targ?.scrollTop);
  }

  const handleLoadMore = () => {
    console.log("loading");
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

  const rows: JSX.Element[] = [];

  for (let i = 0; i < rowsLoaded; i++) {
    const row = data[i];
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
      continue;
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
      <div className="flex flex-col" ref={listRef}>
          {rows}
      </div>
    </div>
  );
}
