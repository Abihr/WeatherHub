export function WeatherCardSkeleton() {
  return (
    <div className="rounded-xl3 p-6 bg-white shadow-card">
      <div className="skeleton h-4 w-24 rounded-full mb-4" />
      <div className="skeleton h-12 w-28 rounded-lg mb-3" />
      <div className="skeleton h-4 w-36 rounded-full mb-6" />
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-14 rounded-xl2" />
        <div className="skeleton h-14 rounded-xl2" />
        <div className="skeleton h-14 rounded-xl2" />
      </div>
    </div>
  );
}

export function FriendCardSkeleton() {
  return (
    <div className="rounded-xl2 p-5 bg-white shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-3.5 w-28 rounded-full mb-2" />
          <div className="skeleton h-3 w-20 rounded-full" />
        </div>
      </div>
      <div className="skeleton h-16 rounded-xl2" />
    </div>
  );
}

export default function Loading({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-400 text-sm">
      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" />
      <span className="ml-1">{label}</span>
    </div>
  );
}

export function ForecastUISkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">

      {/* LOCATION */}
      <div className="bg-white rounded-xl2 shadow-card p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full skeleton" />

          <div className="flex-1">
            <div className="skeleton h-5 w-40 rounded-full mb-2" />
            <div className="skeleton h-3 w-12 rounded-full" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-sky-50 p-3"
            >
              <div className="skeleton h-2.5 w-14 rounded-full mb-2" />
              <div className="skeleton h-4 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* CURRENT WEATHER */}
      <div>
        <div className="skeleton h-5 w-32 rounded-full mb-3" />

        <div className="rounded-xl2 bg-white shadow-card p-5">
          <div className="flex items-center justify-between gap-4">

            <div className="flex-1">
              <div className="skeleton h-3 w-16 rounded-full mb-3" />
              <div className="skeleton h-10 w-24 rounded-lg mb-2" />
              <div className="skeleton h-3 w-28 rounded-full mb-2" />
              <div className="skeleton h-3 w-16 rounded-full" />
            </div>

            <div className="w-32 h-28 flex items-center justify-center">
              <div className="skeleton h-24 w-24 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-sky-50 p-3"
              >
                <div className="skeleton h-4 w-4 rounded mb-2" />
                <div className="skeleton h-2.5 w-16 rounded-full mb-2" />
                <div className="skeleton h-4 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OPTIONAL ALERT */}
      <div className="rounded-xl2 bg-orange-50 border border-orange-100 p-5">
        <div className="flex items-start gap-3">
          <div className="skeleton h-10 w-10 rounded-full shrink-0" />

          <div className="flex-1">
            <div className="skeleton h-4 w-44 rounded-full mb-2" />
            <div className="skeleton h-3 w-full max-w-md rounded-full mb-2" />
            <div className="skeleton h-3 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* 7 DAY FORECAST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-5 w-32 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-full" />
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="
                bg-white
                rounded-xl2
                shadow-card
                px-4
                py-3
                flex
                items-center
                gap-3
              "
            >
              {/* DATE */}
              <div className="w-20 shrink-0">
                <div className="skeleton h-4 w-14 rounded-full" />
              </div>

              {/* WEATHER ICON */}
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <div className="skeleton h-10 w-10 rounded-full" />
              </div>

              {/* TEMPERATURE + BAR */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="skeleton h-4 w-8 rounded-full" />
                  <div className="skeleton h-3 w-8 rounded-full" />
                </div>

                <div className="h-1.5 bg-sky-50 rounded-full overflow-hidden">
                  <div className="skeleton h-full w-2/3 rounded-full" />
                </div>
              </div>

              {/* RAIN */}
              <div className="text-right shrink-0">
                <div className="skeleton h-4 w-10 rounded-full mb-1" />
                <div className="skeleton h-2.5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOURLY FORECAST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-5 w-32 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-full" />
        </div>

        <div className="flex gap-3 overflow-hidden pb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="
                min-w-[125px]
                rounded-xl2
                shadow-card
                p-3
                shrink-0
                bg-white
              "
            >
              {/* TIME */}
              <div className="skeleton h-3 w-12 rounded-full mx-auto mb-2" />

              {/* DAY/NIGHT */}
              <div className="skeleton h-2.5 w-16 rounded-full mx-auto mb-2" />

              {/* WEATHER */}
              <div className="w-14 h-14 mx-auto my-1 flex items-center justify-center">
                <div className="skeleton h-11 w-11 rounded-full" />
              </div>

              {/* TEMPERATURE */}
              <div className="skeleton h-6 w-10 rounded-lg mx-auto mt-2" />

              {/* HUMIDITY */}
              <div className="skeleton h-2.5 w-14 rounded-full mx-auto mt-3" />

              {/* RAIN */}
              <div className="skeleton h-2.5 w-10 rounded-full mx-auto mt-2" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}