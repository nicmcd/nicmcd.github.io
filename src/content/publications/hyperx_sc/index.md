---
slug: hyperx_sc
title: "HyperX Topology: First At-Scale Implementation and Comparison to the Fat-Tree"
authors:
  - jens-domke
  - satoshi-matsuoka
  - ivan-ivanov
  - yuki-tsushima
  - tomoya-yuki
  - akihiro-nomura
  - shinichi-miura
  - admin
  - dennis-floyd
  - nicolas-dube
date: "2019-11-17T00:00:00Z"
type: "1"
venue: In *The International Conference for High Performance Computing, Networking, Storage, and Analysis 2019*
venueShort: In *SC19*
abstract: The de-facto standard topology for modern HPC systems and data-centers are Folded Clos networks, commonly known as Fat-Trees. The number of network endpoints in these systems is steadily increasing. The switch radix increase is not keeping up, forcing an increased path length in these multi-level trees that will limit gains for latency-sensitive applications. Additionally, today's Fat-Trees force the extensive use of active optical cables which carries a prohibitive cost-structure at scale. To tackle these issues, researchers proposed various low-diameter topologies, such as Dragonfly. Another novel, but only theoretically studied, option is the HyperX. We built the world's first 3 Pflop/s supercomputer with two separate networks, a 3-level Fat-Tree and a 12x8 HyperX. This dual-plane system allows us to perform a side-by-side comparison using a broad set of benchmarks. We show that the HyperX, together with our novel communication pattern-aware routing, can challenge the performance of, or even outperform, traditional Fat-Trees.
summary: We present the first at-scale implementation of the HyperX topology and compare it side-by-side to a traditional Fat-Tree.
tags:
  - Networks
doi: 10.1145/3295500.3356140
image: ./featured.png
imageAlt: Dual Plane Network
projects: []
pdf: pubs/nicmcdonald_hyperx_sc_2019.pdf
slides: pubs/nicmcdonald_hyperx_sc_2019_slides.pdf
bibPath: publication/hyperx_sc/cite.bib
---
