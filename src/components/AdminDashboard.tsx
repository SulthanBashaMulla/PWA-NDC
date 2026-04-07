<div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-white to-orange-200">
  <AnimatedBackground />

  <div className="relative z-10">
    <Navbar />

    <div className="p-4 md:p-6">

      {/* PROFILE */}
      <GlassCard strong className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-400/20">
            <Shield size={28} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-gray-600">{user?.designation}</p>
          </div>
        </div>
      </GlassCard>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* LEFT GRID */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">

          {cards.map((c, i) => (
            <GlassCard
              key={i}
              className="aspect-square flex flex-col justify-center items-center cursor-pointer"
              onClick={c.onClick}
            >
              <div className={`p-3 rounded-xl mb-2 ${c.color}`}>
                {c.icon}
              </div>
              <p className="text-sm font-semibold text-center">{c.label}</p>
              <p className="text-xs text-gray-600 text-center mt-1 px-2 truncate">
                {c.desc}
              </p>
            </GlassCard>
          ))}

        </div>

        {/* RIGHT BIG PANEL */}
        <GlassCard className="md:col-span-1 md:row-span-2 p-5 flex flex-col justify-between">

          <div>
            <h3 className="text-lg font-bold mb-2">Dashboard Overview</h3>
            <p className="text-sm text-gray-600">
              Welcome back! Here you can manage notifications, circulars, and users.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="bg-blue-500/10 p-3 rounded-lg text-sm">
              📢 {latestNotice?.Title || 'No notifications'}
            </div>
            <div className="bg-orange-500/10 p-3 rounded-lg text-sm">
              📄 {latestCircular?.Title || 'No circulars'}
            </div>
          </div>

        </GlassCard>

      </div>

    </div>
  </div>
</div>