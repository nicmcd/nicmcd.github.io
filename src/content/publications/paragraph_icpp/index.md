---
slug: paragraph_icpp
title: "ParaGraph: An application-simulator interface and toolkit for hardware-software co-design"
authors:
  - mikhail-isaev
  - admin
  - jeffrey-young
  - richard-vuduc
date: "2022-08-29T00:00:00Z"
type: "1"
venue: In *The 51st International Conference on Parallel Processing 2022*
venueShort: In *ICPP 2022*
abstract: ParaGraph is an open-source toolkit for use in co-designing hardware and software for supercomputer-scale systems. It bridges an infrastructure gap between an application target and existing high-fidelity computer-network simulators. The first component of ParaGraph is a high-level graph representation of a parallel program, which a) faithfully represents parallelism and communication, b) can be extracted automatically from a compiler, and c) is "tuned" for use with network simulators. The second is a runtime that can emulate the representation's dynamic execution for a simulator. User-extensible mechanisms are available for modeling on-node performance and transforming high-level communication into operations that backend simulators understand. Case studies include deep learning workloads that are extracted automatically from programs written in JAX and TensorFlow and interfaced with several event-driven network simulators. These studies show how system designers can use ParaGraph to build flexible end-to-end software-hardware co-design workflows to tweak communication libraries, find future hardware bottlenecks, and validate simulations with traces.
summary: We present ParaGraph, an open-source toolkit that bridges applications and high-fidelity network simulators to enable hardware-software co-design of supercomputer-scale systems.
tags:
  - Simulation
  - Networks
  - Machine Learning
doi: 10.1145/3545008.3545069
image: ./featured.png
imageAlt: ParaGraph organization diagram showing the bridge from a high-level compiler through instruction translation to network simulators via an end-point model running the ParaGraph runtime
projects: []
pdf: pubs/mikhailisaev_paragraph_icpp_2022.pdf
poster: pubs/mikhailisaev_paragraph_icpp_2022_poster.pdf
bibPath: publication/paragraph_icpp/cite.bib
---
