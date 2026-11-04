/**
 * mayLEHUONG - Video Playlist Auto-Crossfade Engine (Optimized for Mobile & Desktop)
 * Tự động xoay tua danh sách video trong từng ô "Vì sao chọn mayLEHUONG"
 */
document.addEventListener("DOMContentLoaded", function () {
  const boxes = document.querySelectorAll(".video-playlist-box");

  boxes.forEach(function (box) {
    var rawList = box.getAttribute("data-videos");
    var videoList = [];
    try {
      videoList = JSON.parse(rawList || "[]");
    } catch (e) {
      videoList = [];
    }

    if (!videoList || !videoList.length) return;

    var activePlayer = box.querySelector(".v-active");
    var nextPlayer = box.querySelector(".v-next");
    if (!activePlayer || !nextPlayer) return;

    var currentIndex = 0;
    var started = false;

    function playVideo(player, rawSrc, onSuccess, onError) {
      var src = encodeURI(rawSrc);
      // Đảm bảo tương thích 100% với chính sách Autoplay trên iOS Safari & Android
      player.muted = true;
      player.defaultMuted = true;
      player.setAttribute("playsinline", "");
      player.setAttribute("webkit-playsinline", "");
      player.src = src;
      player.load();
      
      var playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            if (onSuccess) onSuccess();
          })
          .catch(function (err) {
            console.warn("Auto-play warning for: " + src, err);
            if (onError) onError();
          });
      }
    }

    // Hiển thị player khi bắt đầu phát thành công
    activePlayer.addEventListener("playing", function () {
      activePlayer.style.opacity = "1";
    });

    nextPlayer.addEventListener("playing", function () {
      nextPlayer.style.opacity = "1";
    });

    function startPlaylist() {
      if (started) return;
      started = true;
      playVideo(activePlayer, videoList[0], function() {
        activePlayer.style.opacity = "1";
      });
      setInterval(playNextClip, 6500);
    }

    // Hàm chuyển clip tiếp theo mượt mà
    function playNextClip() {
      if (videoList.length <= 1) return;

      currentIndex = (currentIndex + 1) % videoList.length;
      var nextSrc = videoList[currentIndex];

      playVideo(nextPlayer, nextSrc, function () {
        // Crossfade: Hiện player mới, ẩn player cũ
        nextPlayer.style.zIndex = "10";
        activePlayer.style.zIndex = "0";
        activePlayer.style.opacity = "0";

        // Hoán đổi 2 player
        var temp = activePlayer;
        activePlayer = nextPlayer;
        nextPlayer = temp;
      }, function() {
        console.warn("Skipping unplayable video: " + nextSrc);
      });
    }

    // Khi video hết, tự chuyển sang video kế tiếp
    activePlayer.addEventListener("ended", playNextClip);

    // Cho phép chạm tay trên điện thoại để chuyển nhanh sang video tiếp theo
    box.addEventListener("click", function() {
      if (!started) startPlaylist(); else playNextClip();
    });

    // Chỉ tải video khi người dùng cuộn gần đến khu vực trình chiếu.
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            startPlaylist();
            observer.unobserve(box);
          }
        });
      }, { rootMargin: "300px 0px" });
      observer.observe(box);
    } else {
      startPlaylist();
    }
  });
});
